const template = document.createElement('template');
template.innerHTML = `<style>
*{
    box-sizing: border-box;
    padding: 0;
    margin: 0;    
}
.main{    
    overflow-y: auto;
    box-shadow: 0px 0px 3px 1px #dedede;   
    flex-grow: 1 ;
    position:Sticky;
    top:0px
}
.container{
    display: grid;         
    width: 100%;    
    grid-auto-rows:auto;
    scroll-behavior: smooth;  
    position:relative;
}
.dummy{
    height: 20px;}    
.overall{
    overflow-y: auto;
    width: 100%;   
    display:flex;          
}
::slotted(.header){
    background-color: #fff;
    position: sticky;
    font-size: medium;
    font-weight: 700;
    top: 0;
    z-index:4;
    height:20px
    cursor:pointer;
}
.datacell{   
    border: 1px solid #13ad6b !important;   
}
.rowcolumncell{
    border: 1px solid #13ad6b !important; 
    background-color:#13ad6b;
}
::slotted(*){
    border:1px solid #dedede !important;
}
.main::-webkit-scrollbar {
    display: none;
}
.editor{
    position:absolute;
    border:1px solid #13ad6b ;
    background-color:#fff;
    z-index:20;
    outline:none;
    padding:2px 4px ;
    display:none;   
}
.editor:after{
    content: attr(editingcolumnrow);
    left: -1px;
    position: absolute;
    bottom: 100%;
    background-color: #17a366;
    color: white;
    padding: 2px 5px;
}
.overlapingelement{
    position:absolute;
    border:1px solid #17a366;
    z-index:2;
    display:none;
    background-color:#accef7;
    opacity:0.4;
    pointer-events:none;
}
</style>
<div class='overall'>
<div class=editor></div>
<div class="main" >
    <div class="container">  
      <slot name="columncell"></slot>    
      <div class='overlapingelement'></div>
    </div>
</div>
<div class="dummy"></div>

</div>`
class mycomponent extends HTMLElement {
    constructor() {
        super()
        let shadow = this.attachShadow({ mode: "open" })
        shadow.appendChild(template.content.cloneNode(true))
    }
    CreatingColumns() {
        let container = this.shadowRoot.querySelector('.container')
        let ObjectColumn = this.table.columns
        let ObjectColumnLength = ObjectColumn.length
        for (let i = 0; i <= ObjectColumnLength; i++) {
            let value;
            let element;
            let cell = this.table.cells.columncell
            if (i === 0) {
                element = this.generatingElements(cell)
                this.settingValue(element, cell, 'S.NO')
                container.style.gridTemplateColumns = `auto`;
            } else {
                value = ObjectColumn[i - 1].title
                container.style.gridTemplateColumns += ` 1fr`;
                element = this.generatingElements(cell)
                this.settingValue(element, cell, value)
                element.setAttribute('columnNo', i)
                element.setAttribute('cell', 'columncell')
            }
            this.appendChild(element)
            element.slot = "columncell"
            element.classList.add('header')
        }
    }
    sampleele = document.createElement('div')
    table = ''
    tableheight = 0
    NoOfRowsforBlock = 0
    preblock = 0   
    block = 0
    TotalNoOfBlocks = 0
    previousoverallscrolltop = 0   
    previousmainscrolltop = 0
    currentBlocks = []
    Rowheight = 0
    previousdirection = ''
    // throttlingofOverall = false
    MainElement = true
    overallElement = true
    checkingOverallElement = false
    checkingMainElement = false
    Highlighted = ''
    selectedrowno = 0
    selectedrow = ''
    cellname = ''
    selectedcell
    editor
    CreatingElement(NameOfElement) {
        let ele = document.createElement(NameOfElement)
        return ele
    }
    renderingcells = (number, direction, removeelement) => {
        let container = this.shadowRoot.querySelector('.container')
        let checkinghighlightrow = false
        let checkinghighlightcell = false
        if (this.TotalNoOfBlocks >= number) {
            if (!this.currentBlocks.includes(number) && number !== 0 && number <= this.TotalNoOfBlocks) {
                let end = number * this.NoOfRowsforBlock
                let start = end - this.NoOfRowsforBlock
                let rows = this.table.rows
                let slotinserting;
                let elementinserting;
                let columns_length = this.table.columns.length
                if (direction === 'forward') {
                    this.block = number
                    this.currentBlocks.push(number)
                    this.preblock = number - 2
                    slotinserting = container.lastElementChild
                } else {
                    slotinserting = container.children[1]
                    elementinserting = this.children[columns_length + 1]
                    this.currentBlocks.unshift(number)
                    this.preblock = number
                    this.block = number + 2
                }
                if (this.selectedrowno > start) {
                    if (this.Highlighted === 'rowcell') {
                        checkinghighlightrow = true
                    } else if (this.Highlighted === 'datacell') {
                        checkinghighlightcell = true
                    }
                }
                for (let i = start; i < end; i++) {
                    if (rows[i] !== undefined) {
                        let cell = this.table.cells.rowcell
                        let serialElement = this.generatingElements(cell)
                        this.settingValue(serialElement, cell, i + 1)
                        let serialslot = this.CreatingElement('slot')
                        serialslot.name = `row${i + 1}`
                        serialElement.setAttribute('cell', 'rowcell')
                        serialElement.slot = `row${i + 1}`
                        container.insertBefore(serialslot, slotinserting)
                        if (direction === 'forward') {
                            this.appendChild(serialElement)
                        } else {
                            this.insertBefore(serialElement, elementinserting)
                        }
                        if (checkinghighlightrow) {
                            if (this.selectedrowno === i + 1) {
                                this.highlightingrow(serialElement)
                            }
                        }
                        let column = this.table.columns
                        column.forEach((x) => {
                            let name = x.title
                            let cell = this.table.cells.datacell[name]
                            let value = rows[i][name]
                            let element = this.generatingElements(cell)
                            this.settingValue(element, cell, value)
                            let slot = this.CreatingElement('slot')
                            element.setAttribute('cell', 'datacell')
                            element.setAttribute('tabindex', 0)
                            slot.name = `${name}${i + 1}`
                            container.insertBefore(slot, slotinserting)
                            element.slot = `${name}${i + 1}`
                            if (direction === 'forward') {
                                this.appendChild(element)
                            } else {
                                this.insertBefore(element, elementinserting)
                            }
                            if (checkinghighlightcell) {
                                if (this.selectedrowno === i + 1) {
                                    if (name === this.cellname) {
                                        this.highlightingcells(element)
                                    }
                                }
                            }
                        })
                    } else break
                }
                if (removeelement) {                   
                    if (direction === 'forward') {
                        this.currentBlocks.shift()                       
                        this.RemovingTopMostElements()
                    } else {      
                        let main = this.shadowRoot.querySelector('.main')                 
                        this.currentBlocks.pop()
                        this.RemovingDownMostElement()
                        if(!this.overallElement){
                            main.scrollTop=this.tableheight
                        }
                    }
                }
                if (this.Highlighted === 'rowcell' || this.Highlighted === 'datacell') {
                    let InorOut = this.checkingTheElementInorOut(this.selectedrowno)
                    if (!InorOut) {
                        this.shadowRoot.styleSheets[0].cssRules[6].selectorText = `.nothing`;
                        this.shadowRoot.styleSheets[0].cssRules[7].selectorText = `.nothing`;
                        this.shadowRoot.querySelector('.overlapingelement').style.display = 'none'

                    } else {
                        if (this.Highlighted === 'rowcell') {
                            this.highlightingrow(this.selectedrow)
                        } else {
                            this.highlightingcells(this.selectedcell)
                        }
                    }
                }
            }
        }
    }
    // throttlingthesroll=(callback,time)=>{        
    //     if(this.throttlingofOverall)return
    //     this.throttlingofOverall=true
    //     setTimeout(() => {
    //         callback()
    //         this.throttlingofOverall=false
    //     }, time);
    // }
    overallElementScrolling = () => {
        let overall = this.shadowRoot.querySelector('.overall')
        if (this.checkingOverallElement === true) {
            this.checkingOverallElement = false
            this.overallElement = false
        } else {
            this.overallElement = true
        }
        if (this.overallElement) {           
            let main = this.shadowRoot.querySelector('.main')
            let scrolltop = Math.floor(overall.scrollTop)
            let scrollheight = overall.scrollHeight
            let clientheight = overall.clientHeight
            let bottom = scrollheight - clientheight
            this.checkingMainElement = true
            if (this.TotalNoOfBlocks > 3) {
                let block = Math.ceil(scrolltop / this.tableheight)               
                if (overall.scrollTop > this.previousoverallscrolltop) {
                    if (scrolltop === bottom) {
                        block = this.TotalNoOfBlocks - 1
                    }
                    if (block === this.currentBlocks[0]) {
                        if ((scrolltop % this.tableheight) !== 0) {
                            main.scrollTop = scrolltop % this.tableheight
                        }
                    } else if (block === this.currentBlocks[1]) {
                        if ((scrolltop % this.tableheight) !== 0) {
                            main.scrollTop = (this.tableheight )+ (scrolltop % this.tableheight)
                        }
                    } else if (block >= this.currentBlocks[2]) {
                        this.CheckingGenratedBlocks(block, 'forward')
                    }
                } else {
                    if (block === this.currentBlocks[1]) {
                        if ((scrolltop % this.tableheight) !== 0) {
                            main.scrollTop = this.tableheight + (scrolltop % this.tableheight)
                        }
                    } else if (block <= this.currentBlocks[0]) {
                        if ((scrolltop % this.tableheight) !== 0) {
                            main.scrollTop = (scrolltop % this.tableheight)
                        }
                    }
                    if (block <= (this.currentBlocks[0] - 1)) {
                        if (scrolltop === 0 || block === 1) {
                            block = 2
                        }
                        this.CheckingGenratedBlocks(block, 'backward')
                    }
                }
                if (scrolltop === bottom) {
                    main.scrollTop = (2 * this.tableheight) + this.Rowheight
                } else if (scrolltop === 0) {
                    main.scrollTop = 0
                }
            }
            else {
                main.scrollTop = overall.scrollTop
            }
        }
        this.previousoverallscrolltop = overall.scrollTop
    }
    MainElementScrolling = () => {
        if (this.checkingMainElement === true) {
            this.checkingMainElement = false
            this.MainElement = false
        } else {
            this.MainElement = true
        }
        if (this.MainElement) {
            let overall = this.shadowRoot.querySelector('.overall')
            var main = this.shadowRoot.querySelector('.main');
            var scrollheight = main.scrollHeight;
            var clientheight = main.clientHeight;
            var bottom = scrollheight - clientheight;
            var scrolltop = Math.round(main.scrollTop)
            this.checkingOverallElement = true
            if (this.TotalNoOfBlocks > 3) {
                if (scrolltop >= this.previousmainscrolltop) {
                    if (scrolltop === bottom) {
                        this.renderingcells(this.block + 1, 'forward', true)
                        if (this.block === this.TotalNoOfBlocks) {
                            overall.scrollTop = overall.scrollHeight - this.tableheight
                        }
                    }
                    else {
                        overall.scrollTop = (this.preblock - 1) * (this.NoOfRowsforBlock * this.Rowheight) + (scrolltop)
                    }
                } else {
                    if (scrolltop === 0) {
                        this.renderingcells(this.preblock - 1, 'backward', true)
                        if (this.preblock === 1) {
                            overall.scrollTop = 0
                        }
                        else {
                            setTimeout(() => {
                                main.scrollTop = this.tableheight
                            }, 18);
                        }
                    } else {
                        overall.scrollTop = (this.preblock - 1) * (this.NoOfRowsforBlock * this.Rowheight) + (scrolltop)
                    }
                }
                this.previousmainscrolltop = scrolltop
            } else {
                overall.scrollTop = scrolltop
            }
        }
    }
    RemovingTopMostElements() {
        let column = this.table.columns
        let elementIndex = column.length + 1
        let container = this.shadowRoot.querySelector('.container')
        for (let i = 1; i <= this.NoOfRowsforBlock; i++) {
            this.children[elementIndex].remove()
            container.children[1].remove()
            column.forEach(x => {
                this.children[elementIndex].remove()
                container.children[1].remove()
            })
        }
    }
    RemovingDownMostElement() {
        let container = this.shadowRoot.querySelector('.container')
        let columns_length = this.table.columns.length
        let NoOfchildForThreeBlocks = ((this.NoOfRowsforBlock * (columns_length + 1)) * 3) + (columns_length + 1)
        let totalNoOfChildrens = this.childElementCount
        for (let i = NoOfchildForThreeBlocks; i < totalNoOfChildrens; i++) {
            if (this.children[NoOfchildForThreeBlocks]) {
                this.children[NoOfchildForThreeBlocks].remove()
                container.children[NoOfchildForThreeBlocks - columns_length].remove()
            } else break
        }
    }
    CheckingGenratedBlocks(number, direction) {
        let previous = number - 1
        let next = number + 1
        if (direction === 'forward') {
            this.renderingcells(previous, 'forward', true)
            this.renderingcells(number, 'forward', true)
            this.renderingcells(next, 'forward', true)
        } else {
            this.renderingcells(next, 'backward', true)
            this.renderingcells(number, 'backward', true)
            this.renderingcells(previous, 'backward', true)
        }
    }
    highlighting = (e) => {
        let arrayofele = document.elementsFromPoint(e.x, e.y)
        let arrayofeleLength=arrayofele.length
        let Element;
        for(let i=0;i<arrayofeleLength;i++){
            if(arrayofele[i].hasAttribute('cell')){
                Element=arrayofele[i]
                break
            }
        }       
        let attribute = Element.getAttribute('cell')
        if (attribute === 'columncell' || attribute === 'rowcell') {
            let overlapelement = this.shadowRoot.querySelector('.overlapingelement')
            this.selectedcell = undefined
            if (this.Highlighted !== attribute) {
                overlapelement.style.display = 'block'
            }
            if (attribute === 'columncell') {
                let width = Element.offsetWidth
                overlapelement.style.width = `${width}px`;
                overlapelement.style.height = `100%`
                this.overlapingelement(Element,'column')
                let columnNo = Element.getAttribute('columnNo') / 1 + 1
                this.shadowRoot.styleSheets[0].cssRules[7].selectorText = `::slotted(*:nth-child(${columnNo}))`;
                this.shadowRoot.styleSheets[0].cssRules[6].selectorText = 'nothing'
            } else {
                let height = Element.offsetHeight
                overlapelement.style.width = `100%`
                overlapelement.style.height = `${height}px`
                this.highlightingrow(Element)
            }
        }
        else if (attribute === 'datacell') {
            this.highlightingcells(Element)
        }
        this.Highlighted = attribute
    }
    checkingTheElementInorOut(ip) {
        let returnvalue = false
        let array = this.currentBlocks
        let arraylength = array.length
        for (let i = 0; i < arraylength; i++) {
            let end = array[i] * this.NoOfRowsforBlock
            let start = end - this.NoOfRowsforBlock
            if (ip > start && ip <= end) {
                returnvalue = true
                break
            }
        }
        return returnvalue
    }
    highlightingrow(inputelement) {
        this.selectedrowno = (inputelement.innerHTML) / 1
        this.selectedrow = inputelement
        this.overlapingelement(inputelement, 'row')
        let index = this.findingindex(inputelement)
        this.shadowRoot.styleSheets[0].cssRules[7].selectorText = `::slotted(*:nth-child(${index + 1})`;
        this.shadowRoot.styleSheets[0].cssRules[6].selectorText = 'nothing'
    }
    highlightingcells(cell) {
        this.Checkingelementinviewport(cell)
        if (!this.editor) {
            cell.focus({ preventScroll: true })
        }
        if (this.Highlighted === 'rowcell' || this.Highlighted === 'columncell') {
            this.shadowRoot.querySelector('.overlapingelement').style.display = 'none'
        }
        this.selectedcell = cell
        let index = this.findingindex(cell)
        let rowsLength = this.table.columns.length + 1
        let cellrow = Math.floor(index / rowsLength)
        this.cellname = this.table.columns[(index % rowsLength) - 1].title
        this.selectedrowno = (this.children[cellrow * rowsLength].innerHTML) / 1
        this.shadowRoot.styleSheets[0].cssRules[6].selectorText = `::slotted(*:nth-child(${index + 1})`;
        this.shadowRoot.styleSheets[0].cssRules[7].selectorText = `nothing`;
    }
    overlapingelement = (element,highlighted) => {
        let left;
        let top;
        if(highlighted==='row'){
            left = element.offsetLeft
            top = element.offsetTop
        }else{
            left=element.getBoundingClientRect().left
            top=element.getBoundingClientRect().top
        }
        let overlapele = this.shadowRoot.querySelector('.overlapingelement')
        overlapele.style.display = 'block'
        overlapele.style.left = `${left}px`
        overlapele.style.top = `${top}px`
    }
    Keyoperating = (e) => {
        let rowsLength = this.table.columns.length + 1
        let index;
        if (e.keyCode >= 37 && e.keyCode <= 40) {
            if (!this.editor) {
                e.preventDefault()
                let element = e.target
                let targetelement;
                if (e.keyCode === 37) {
                    targetelement = element.previousElementSibling
                } else if (e.keyCode === 39) {
                    targetelement = element.nextElementSibling
                } else if (e.keyCode === 38) {
                    index = this.findingindex(element)
                    targetelement = this.children[index - rowsLength]
                } else if (e.keyCode === 40) {
                    index = this.findingindex(element)
                    targetelement = this.children[index + rowsLength]
                }
                if (targetelement) {
                    if (targetelement.getAttribute('cell') === 'datacell') {
                        if (!element.hasAttribute('contenteditable')) {
                            this.highlightingcells(targetelement)
                        }
                    }
                }
            }
        }
        if (e.keyCode === 13) {
            e.preventDefault()
            if (!this.editor) {
                this.editing()
            } else {
                this.editor = false
                if (this.selectedcell.isConnected) {
                    this.highlightingcells(this.selectedcell)
                } else {
                    this.bluring()
                }
            }
        }
    }
    editing = () => {
        if (this.selectedcell) {
            let index = this.findingindex(this.selectedcell)
            let rowsLength = this.table.columns.length + 1
            let column = (index % rowsLength) - 1
            let editable = this.table.columns[column].editable
            if (editable) {
                this.openingEditor(this.selectedcell)
            } else {
                alert('This column cannot be edit')
            }
        }
    }
    Checkingelementinviewport = (element) => {
        let main = this.shadowRoot.querySelector('.main')
        let top = element.getBoundingClientRect().top
        let bottom = element.getBoundingClientRect().bottom
        if (top < this.Rowheight || bottom > this.tableheight) {
            if (top < this.Rowheight) {
                if (top === 0) {
                    main.scrollBy(0, -`${this.Rowheight}`)
                } else {
                    main.scrollBy(0, -`${this.Rowheight - top}`)
                }
            } else {
                if (bottom === (this.tableheight + this.Rowheight)) {
                    main.scrollBy(0, `${this.Rowheight}`)
                } else {
                    main.scrollBy(0, `${bottom % this.tableheight}`)
                }
            }
        }
    }
    openingEditor = (element) => {
        this.editor = true
        let left = element.getBoundingClientRect().left
        let top = element.getBoundingClientRect().top
        let width = element.getBoundingClientRect().width
        let height = element.getBoundingClientRect().height
        let editor = this.shadowRoot.querySelector('.editor')
        editor.style.left = `${left}px`;
        editor.style.top = `${top}px`;
        editor.style.minWidth = `${width}px`;
        editor.style.minHeight = `${height}px`;
        editor.addEventListener('blur', this.bluring)
        if (!editor.hasAttribute('contenteditable')) {
            editor.setAttribute('contenteditable', 'true')
        }
        if (!editor.hasAttribute('tabindex')) {
            editor.setAttribute('tabindex', 0)
        }
        editor.setAttribute('editingcolumnrow', `${this.cellname}${this.selectedrowno}`)
        editor.style.display = 'block';
        editor.innerText = this.table.rows[this.selectedrowno - 1][this.cellname]
        editor.focus({ preventScroll: true })
    }
    bluring = () => {
        this.editor = false
        let editor = this.shadowRoot.querySelector('.editor')
        editor.style.display = 'none'
        let value = editor.innerText
        if (this.selectedcell.isConnected) {
            let cell = this.table.cells.datacell[this.cellname]
            this.settingValue(this.selectedcell, cell, value)
        }
        this.table.rows[this.selectedrowno - 1][this.cellname] = value
        editor.removeEventListener('blur', this.bluring)
    }
    settingValue = (element, cell, value) => {
        let child = cell.childselector
        let att = cell.corespondingatt
        if (child) {
            element = element.querySelector(`${child}`)
        }
        if (att === 'innerText' || att === 'innerHTML'||att==='checked') {
            element[att] = value
        } else {            
            element.setAttribute(att, value)
        }

    }
    findingindex(e) {
        let att = e.hasAttribute('cell')
        if (att) {
            let parentele = this
            let childs = parentele.children;
            let array = Array.from(childs)
            let index = array.indexOf(e);
            return index;
        }
    }
    generatingElements = (cell) => {
        let elementinstring = cell.element
        this.sampleele.innerHTML = elementinstring
        let element = this.sampleele.firstElementChild
        return element
    }
    connectedCallback() {
        this.tableheight = this.getAttribute('tableheight')/1
        let container = this.shadowRoot.querySelector('.container')
        let data = this.getAttribute('data')
        this.table = JSON.parse(data)
        this.CreatingColumns()
        this.Rowheight = this.getAttribute('rowheight')
        this.shadowRoot.styleSheets[0].cssRules[2].style.gridAutoRows = `${this.Rowheight}px`
        let lengthOfRows = this.table.rows.length
        let overall = this.shadowRoot.querySelector('.overall')
        overall.style.height = this.tableheight + 'px'
        this.shadowRoot.querySelector('.dummy').style.height = (this.Rowheight * lengthOfRows) + 'px'
        this.NoOfRowsforBlock = Math.floor((this.tableheight / this.Rowheight))
        this.TotalNoOfBlocks = Math.ceil((lengthOfRows / this.NoOfRowsforBlock))
        for (let i = 1; i <= 3; i++) {
            this.renderingcells(i, 'forward', false)
        }
        let main = this.shadowRoot.querySelector('.main')
        main.addEventListener('scroll', this.MainElementScrolling)
        container.addEventListener('click', this.highlighting)
        overall.addEventListener('scroll', this.overallElementScrolling)
        overall.addEventListener('keydown', this.Keyoperating)
        overall.addEventListener('dblclick', this.editing)
    }
}
customElements.define("table-component", mycomponent)