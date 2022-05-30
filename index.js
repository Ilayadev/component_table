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
    height:20px
    cursor:pointer;
}
.datacell{   
    border: 1px solid #1e8d36 !important;   
}
.rowcolumncell{
    border: 1px solid #1e8d36 !important; 
    background-color:#1e8d36;
}
::slotted(*){
    border:1px solid #dedede !important;
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
    z-index:10;
    display:none;
}
</style>
<div class='overall'>
<div class=editor></div>
<div class=overlapingelement></div>
<div class="main" >
    <div class="container">  
      <slot name="columncell"></slot>   
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
            if (i === 0) {
                element = this.generatingElements(this.table.cells.columncell, "S.NO")
                container.style.gridTemplateColumns = `auto`;
            } else {
                value = ObjectColumn[i - 1].title
                container.style.gridTemplateColumns += ` 1fr`;
                element = this.generatingElements(this.table.cells.columncell, value)
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
    scrollvariable = 0
    previousmainscrolltop = 0
    currentBlocks = []
    Rowheight = 0
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
    renderingRowsForward = (number, removeelement) => {
        let container = this.shadowRoot.querySelector('.container')
        let checkinghighlightrow = false
        let checkinghighlightcell = false
        if (this.TotalNoOfBlocks >= number) {
            if (!this.currentBlocks.includes(number) && number !== 0) {
                let end = number * this.NoOfRowsforBlock
                let start = end - this.NoOfRowsforBlock
                let rows = this.table.rows
                this.block = number
                this.currentBlocks.push(number)
                this.preblock = number - 2
                if (this.selectedrowno > start) {
                    if (this.Highlighted === 'rowcell') {
                        checkinghighlightrow = true
                    } else if (this.Highlighted === 'datacell') {
                        checkinghighlightcell = true
                    }
                }
                for (let i = start; i < end; i++) {
                    if (rows[i] !== undefined) {
                        let serialElement = this.generatingElements(this.table.cells.rowcell, i + 1)
                        let serialslot = this.CreatingElement('slot')
                        serialslot.name = `row${i + 1}`
                        serialElement.setAttribute('cell', 'rowcell')
                        serialElement.slot = `row${i + 1}`
                        container.appendChild(serialslot)
                        this.appendChild(serialElement)
                        if (checkinghighlightrow) {
                            if (this.selectedrowno === i + 1) {
                                this.highlightingrow(serialElement)
                            }
                        }
                        let column = this.table.columns
                        column.forEach((x) => {
                            let name = x.title
                            let value = rows[i][name]
                            let element = this.generatingElements(this.table.cells.datacell[name], value)
                            let slot = this.CreatingElement('slot')
                            element.setAttribute('cell', 'datacell')
                            element.setAttribute('tabindex', 0)
                            slot.name = `${name}${i + 1}`
                            container.appendChild(slot)
                            element.slot = `${name}${i + 1}`
                            this.appendChild(element)
                            if (checkinghighlightcell) {
                                if (this.selectedrowno === i + 1) {
                                    if (name === this.cellname) {
                                        this.highlightingcells(element)
                                    }
                                }
                            }
                        })
                    } else  break
                }
                if (removeelement) {
                    this.currentBlocks.shift()
                    this.RemovingTopMostElements()
                }
                if (this.Highlighted === 'rowcell' || this.Highlighted === 'datacell') {
                    let InorOut = this.checkingTheElementInorOut(this.selectedrowno)
                    if (!InorOut) {
                        this.shadowRoot.styleSheets[0].cssRules[6].selectorText = `.nothing`;
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
    renderingRowsBackward(number) {
        let main = this.shadowRoot.querySelector('.main')
        let container = this.shadowRoot.querySelector('.container')
        let checkinghighlightrow = false
        let checkinghighlightcell = false
        if (!this.currentBlocks.includes(number) && number !== 0 && number <= this.TotalNoOfBlocks) {
            let end = number * this.NoOfRowsforBlock
            let start = end - this.NoOfRowsforBlock
            let rows = this.table.rows
            this.currentBlocks.unshift(number)
            this.currentBlocks.pop()
            this.preblock = number
            this.block = number + 2
            let column = this.table.columns
            let columns_length = column.length
            let slotinserting = container.children[1]
            let elementinserting = this.children[columns_length + 1]
            if (this.selectedrowno > start) {
                if (this.Highlighted === 'rowcell') {
                    checkinghighlightrow = true
                } else if (this.Highlighted === 'datacell') {
                    checkinghighlightcell = true
                }
            }
            for (let i = start; i < end; i++) {
                let serialElement = this.generatingElements(this.table.cells.rowcell, i + 1)
                let serialslot = this.CreatingElement('slot')
                serialElement.setAttribute('cell', 'rowcell')
                serialslot.name = `row${i + 1}`
                serialElement.slot = `row${i + 1}`
                container.insertBefore(serialslot, slotinserting)
                this.insertBefore(serialElement, elementinserting)
                if (checkinghighlightrow) {
                    if (this.selectedrowno === i + 1) {
                        this.highlightingrow(serialElement)
                    }
                }
                column.forEach(x => {
                    let name = x.title
                    let value = rows[i][name]
                    let element = this.generatingElements(this.table.cells.datacell[name], value)
                    let slot = this.CreatingElement('slot')
                    element.setAttribute('cell', 'datacell')
                    element.setAttribute('tabindex', 0)
                    slot.name = `${name}${i + 1}`
                    element.slot = `${name}${i + 1}`
                    container.insertBefore(slot, slotinserting)
                    this.insertBefore(element, elementinserting)
                    if (checkinghighlightcell) {
                        if (this.selectedrowno === i + 1) {
                            if (name === this.cellname) {
                                this.highlightingcells(element)
                            }
                        }
                    }

                })
            }
            this.RemovingDownMostElement()
            main.scrollTop = this.tableheight
            if (this.Highlighted === 'rowcell' || this.Highlighted === 'datacell') {
                let InorOut = this.checkingTheElementInorOut(this.selectedrowno)
                if (!InorOut) {
                    this.shadowRoot.styleSheets[0].cssRules[6].selectorText = `.nothing`;
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
                    if (block !== 1) {
                        this.scrollvariable = 1
                        this.CheckingGenratedBlocks(block, "forward")
                    } else {
                        this.scrollvariable = 0
                    }
                } else {
                    this.scrollvariable = 0
                    if (scrolltop === 0 || block === 1) {
                        block = 2
                    }
                    this.CheckingGenratedBlocks(block, "backward")
                }
                if (scrolltop === bottom) {
                    main.scrollTop = (2 * this.tableheight) + this.Rowheight
                } else if (scrolltop === 0) {
                    main.scrollTop = 0
                }
                else {
                    main.scrollTop = (this.scrollvariable * (this.NoOfRowsforBlock * this.Rowheight)) + (scrolltop % this.tableheight)

                }
            }
            else {
                main.scrollTop = overall.scrollTop
            }
        }
        this.previousoverallscrolltop = overall.scrollTop
    }
    MainElementScrolling = () => {
        if(this.Highlighted==='rowcell'||this.Highlighted==="columncell"){
            if(this.Highlighted==='rowcell'){
                let top=this.selectedrow.getBoundingClientRect().top
                let bottom=this.selectedrow.getBoundingClientRect().bottom
                if(top>=20&&bottom<600){
                    this.overlapingelement(this.selectedrow,'row')
                }else{
                    this.shadowRoot.querySelector('.overlapingelement').style.display='none'
                }
            }
        }
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
                    if (scrolltop===bottom) {
                        // this.CheckingGenratedBlocks(this.block,"forward")
                        this.renderingRowsForward(this.block + 1, true)
                        if (this.block === this.TotalNoOfBlocks) {
                            overall.scrollTop = overall.scrollHeight - this.tableheight
                        }
                    }
                    else {
                        overall.scrollTop = (this.preblock - 1) * (this.NoOfRowsforBlock * this.Rowheight) + (scrolltop)
                    }
                } else {
                    if (scrolltop === 0) {
                        // this.CheckingGenratedBlocks(this.preblock,"backward")  
                        this.renderingRowsBackward(this.preblock - 1)
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
        for (let i = 0; i < totalNoOfChildrens; i++) {
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
            this.renderingRowsForward(previous, true)
            this.renderingRowsForward(number, true)
            this.renderingRowsForward(next, true)
        } else {
            this.renderingRowsBackward(next)
            this.renderingRowsBackward(number)
            this.renderingRowsBackward(previous)
        }
    }
    highlighting = (e) => {
        let Element = e.target
        let attribute = Element.getAttribute('cell')       
        if (attribute === 'columncell') {            
            this.selectedcell = undefined
            let columnNo = Element.getAttribute('columnNo') / 1+1 
            this.overlapingelement(Element,'column')
            this.shadowRoot.styleSheets[0].cssRules[7].selectorText = `::slotted(*:nth-child(${columnNo}))`;
            this.shadowRoot.styleSheets[0].cssRules[6].selectorText='nothing'
        } else if (attribute === 'rowcell') {
            this.highlightingrow(Element)
        } else if (attribute === 'datacell') {
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
        this.selectedcell = undefined
        this.selectedrowno = (inputelement.innerHTML) / 1
        this.selectedrow = inputelement
        // let rowsLength = this.table.columns.length
        this.overlapingelement(inputelement,'row')
        let index = this.findingindex(inputelement)
        // let start = index + 1
        // let end = start + rowsLength
        this.shadowRoot.styleSheets[0].cssRules[7].selectorText = `::slotted(*:nth-child(${index+1})`;
        this.shadowRoot.styleSheets[0].cssRules[6].selectorText='nothing'
    }
    highlightingcells(cell) {       
        this.Checkingelementinviewport(cell)
        if (!this.editor) {
            cell.focus({ preventScroll: true })
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
    overlapingelement=(element,cell)=>{
        let left=element.getBoundingClientRect().left
        let top=element.getBoundingClientRect().top
        let overlapele=this.shadowRoot.querySelector('.overlapingelement')
        overlapele.style.display='block'
        overlapele.style.left=`${left}px`
        overlapele.style.top=`${top}px`
        if(cell==='row'){
            let  parentwidth=this.shadowRoot.querySelector('.container').clientWidth
            let height=element.getBoundingClientRect().height
            overlapele.style.height=`${height}px`
            overlapele.style.width=`${parentwidth}px`
        }
    }
    Keyoperating = (e) => {
        let main = this.shadowRoot.querySelector('.main')
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
        let value = this.Takingvaluefromelement('editor')
        if (this.selectedcell.isConnected) {
            let child = this.table.cells.datacell[this.cellname].childselector
            let att = this.table.cells.datacell[this.cellname].corespondingatt
            if (child) {
                this.selectedcell.querySelector(`${child}`)[att] = value
            } else {
                this.selectedcell[att] = value
            }
        }
        this.table.rows[this.selectedrowno - 1][this.cellname] = value
        editor.removeEventListener('blur', this.bluring)
    }
    Takingvaluefromelement = (from) => {
        let value;
        if (from === 'element') {
            let cell = this.table.cells.datacell[this.cellname]
            let child = cell.childselector
            let att = cell.corespondingatt
            if (child) {
                value = this.selectedcell.querySelector(`${child}`)[att]
            } else {
                value = this.selectedcell[att]
            }
        } else if (from === 'editor') {
            value = this.shadowRoot.querySelector('.editor').innerText
        }
        return value
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
    generatingElements = (cell, value) => {
        let elementinstring = cell.element
        this.sampleele.innerHTML = elementinstring
        let element = this.sampleele.firstElementChild
        let att = cell.corespondingatt
        if (value === "true" || value === "false") {
            if (value === "true") {
                value = true
            } else {
                value = false
            }
        }
        if (cell.childselector === false) {
            element[att] = value
        } else {
            let childselector = cell.childselector
            let child = element.querySelector(`${childselector}`)
            child[att] = value
        }
        return element
    }
    connectedCallback() {
        this.tableheight = this.getAttribute('tableheight')
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
            this.renderingRowsForward(i, false)
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