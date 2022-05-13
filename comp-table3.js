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
}
.item{
    border: 1px solid #dedede;   
    text-align: center;   
    outline: none; 
}   
.header{
    background-color: #fff;
    position: sticky;
    top: 0;
    cursor:pointer;
    height:20px
}
.dummy{
    height: 20px;}    
.overall{
    overflow-y: auto;
    width: 100%;   
    display:flex;
    border: 1px solid #dedede; 
}
.slotted{
    background-color: rgb(191, 240, 191);  
    border: 1px solid lightgreen !important;   
}
.compelement{
    background-color: rgb(191, 240, 191);  
    border: 1px solid lightgreen !important;   
}
</style>
<div class='overall'>
<div class="main" >
    <div class="container">     
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
            let element = this.CreatingElement('div')
            if (i === 0) {
                value = 'S.NO'
                container.style.gridTemplateColumns = `auto`;
            } else {
                value = ObjectColumn[i - 1].title
                container.style.gridTemplateColumns += ` 1fr`;
                element.setAttribute('type', 'column')
                element.setAttribute('columnNo', i)
            }
            element.classList.add('header')
            element.innerHTML = value
            container.appendChild(element)
        }
    }
    table = ''
    tableheight = 0
    NoOfRowsforBlock = 0
    preblock = 0
    block = 0
    TotalNoOfBlocks = 0
    previousscrolltop = 0
    scrollvariable = 0
    currentscrolltop = 0
    currentBlocks = []
    Rowheight = 0
    throttlingofOverall = false
    MainElement = true
    overallElement = true
    checkingOverallElement = false
    checkingMainElement = false
    Highlighted = ''
    selectedrowno = 0
    selectedrow = ''
    cellname = ''
    selectedcell = ''
    CreatingElement(NameOfElement) {
        let ele = document.createElement(NameOfElement)
        ele.classList.add('item')
        return ele
    }
    renderingRowsForward(number, removeelement) {
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
                    if (this.Highlighted === 'row') {
                        checkinghighlightrow = true
                    } else {
                        checkinghighlightcell = true
                    }
                }
                for (let i = start; i < end; i++) {
                    if (rows[i] !== undefined) {
                        let serialElement = this.CreatingElement('div')
                        serialElement.setAttribute('type', 'row')
                        serialElement.style.height = this.Rowheight + 'px'
                        serialElement.innerHTML = i + 1
                        container.appendChild(serialElement)
                        if (checkinghighlightrow) {
                            if (this.selectedrowno === i + 1) {
                                this.highlightingrow(serialElement)
                            }
                        }
                        let column = this.table.columns
                        column.forEach((x) => {
                            let name = x.title
                            let elementobj = rows[i][name]
                            let element = this.generatingElements(elementobj)
                            element.setAttribute('type', 'cells')
                            let slot = this.CreatingElement('slot')
                            slot.name = `${name}${i + 1}`
                            container.appendChild(slot)
                            element.slot = `${name}${i + 1}`
                            element.style.height = this.Rowheight + 'px'
                            this.appendChild(element)
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
                    this.currentBlocks.shift()
                    this.RemovingTopMostElements()
                }
                if (this.Highlighted === 'row' || this.Highlighted === 'cells') {
                    let InorOut = this.checkingTheElementInorOut(this.selectedrowno)
                    if (!InorOut) {
                        this.shadowRoot.styleSheets[0].cssRules[7].selectorText = `.nothing`;
                        if (this.Highlighted === 'row') {
                            this.shadowRoot.styleSheets[0].cssRules[8].selectorText = `.nothing`
                        }
                    } else {
                        if (this.Highlighted === 'row') {
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
            let columns_length = this.table.columns.length
            let insertingElement = container.children[columns_length + 1]
            let column = this.table.columns
            let insertingelementincomp = this.children[0]
            if (this.selectedrowno > start) {
                if (this.Highlighted === 'row') {
                    checkinghighlightrow = true
                } else {
                    checkinghighlightcell = true
                }
            }
            for (let i = start; i < end; i++) {
                let serialElement = this.CreatingElement('div')
                serialElement.innerHTML = i + 1
                serialElement.style.height = this.Rowheight + 'px'
                serialElement.setAttribute('type', 'row')
                container.insertBefore(serialElement, insertingElement)
                if (checkinghighlightrow) {
                    if (this.selectedrowno === i + 1) {
                        this.highlightingrow(serialElement)
                    }
                }
                column.forEach(x => {
                    let name = x.title
                    let elementobj = rows[i][name]
                    let element = this.generatingElements(elementobj)
                    element.setAttribute('type', 'cells')
                    let slot = this.CreatingElement('slot')
                    slot.name = `${name}${i + 1}`
                    container.insertBefore(slot, insertingElement)
                    element.slot = `${name}${i + 1}`
                    element.style.height = this.Rowheight + 'px'
                    this.insertBefore(element, insertingelementincomp)
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
            if (this.Highlighted === 'row' || this.Highlighted === 'cells') {
                let InorOut = this.checkingTheElementInorOut(this.selectedrowno)
                if (!InorOut) {
                    this.shadowRoot.styleSheets[0].cssRules[7].selectorText = `.nothing`;
                    if (this.Highlighted === 'row') {
                        this.shadowRoot.styleSheets[0].cssRules[8].selectorText = `.nothing`
                    }
                } else {
                    if (this.Highlighted === 'row') {
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
        if (this.checkingOverallElement === true) {
            this.checkingOverallElement = false
            this.overallElement = false
        } else {
            this.overallElement = true
        }
        if (this.overallElement) {
            let overall = this.shadowRoot.querySelector('.overall')
            let main = this.shadowRoot.querySelector('.main')
            let scrolltop = Math.round(overall.scrollTop)
            let scrollheight = overall.scrollHeight
            let clientheight = overall.clientHeight
            let bottom = scrollheight - clientheight
            this.checkingMainElement = true
            if (this.TotalNoOfBlocks > 3) {
                let block = Math.ceil(scrolltop / this.tableheight)
                if (scrolltop >= this.previousscrolltop) {
                    if (scrolltop === bottom) {
                        block = this.TotalNoOfBlocks - 1
                    }
                    if (block !== 1) {
                        this.scrollvariable = 1
                        this.CheckingGenratedBlocks(block, 'forward')
                    }
                } else {
                    if (scrolltop === 0) {
                        block = 2
                    }
                    this.scrollvariable = 0
                    this.CheckingGenratedBlocks(block, 'backward')
                }
                this.previousscrolltop = scrolltop
                if (scrolltop === bottom) {
                    main.scrollTop = (2 * this.tableheight) + 20
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
                if (scrolltop >= this.currentscrolltop) {
                    this.currentscrolltop = scrolltop
                    if (scrolltop === bottom) {
                        if (this.block < this.TotalNoOfBlocks) {
                            this.CheckingGenratedBlocks(this.block, 'forward')
                        }
                        if (this.block === this.TotalNoOfBlocks) {
                            overall.scrollTop = (this.preblock - 1) * (this.NoOfRowsforBlock * this.Rowheight) + (scrolltop)
                        }
                    }
                    else {
                        overall.scrollTop = (this.preblock - 1) * (this.NoOfRowsforBlock * this.Rowheight) + (scrolltop)
                    }
                } else {
                    this.currentscrolltop = scrolltop
                    if (scrolltop === 0) {
                        if (this.preblock > 1) {
                            this.CheckingGenratedBlocks(this.preblock, 'backward')
                        }
                        if (this.preblock === 1) {
                            overall.scrollTop = 0
                        }
                        else {
                            setTimeout(() => {
                                main.scrollTop = this.tableheight
                            }, 1);
                        }

                    } else {
                        overall.scrollTop = (this.preblock - 1) * (this.NoOfRowsforBlock * this.Rowheight) + (scrolltop)
                    }
                }
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
            container.children[elementIndex].remove()
            column.forEach(x => {
                container.children[elementIndex].remove()
            })
        }
        for (let i = 1; i <= this.NoOfRowsforBlock; i++) {
            column.forEach(x => {
                this.children[0].remove()
            })
        }
    }
    RemovingDownMostElement() {
        let container = this.shadowRoot.querySelector('.container')
        let columns_length = this.table.columns.length + 1
        let NoOfchildForThreeBlocks = (this.NoOfRowsforBlock * 3) * columns_length + columns_length
        let totalNoOfChildrens = container.childElementCount
        for (let i = 0; i < totalNoOfChildrens; i++) {
            if (container.children[NoOfchildForThreeBlocks]) {
                container.children[NoOfchildForThreeBlocks].remove()
            } else break
        }
        let Noofelement = this.NoOfRowsforBlock * this.table.columns.length * 3
        let componentchildrens = this.childElementCount
        for (let i = 1; i <= componentchildrens; i++) {
            if (this.children[Noofelement]) {
                this.children[Noofelement].remove()
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
        let attribute = Element.getAttribute('type')
        let index;
        let rowsLength = this.table.columns.length
        if (attribute === 'column') {
            index = this.findingindex(Element, 'container')
            let columnNo = Element.getAttribute('columnNo') / 1
            this.shadowRoot.styleSheets[0].cssRules[8].selectorText = `.item:nth-child(${index + 1})`
            this.shadowRoot.styleSheets[0].cssRules[7].selectorText = `::slotted(*:nth-child(${rowsLength}n+${columnNo}))`;
        } else if (attribute === 'row') {
            this.highlightingrow(Element)
        } else if (attribute === 'cells') {
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
        let rowsLength = table.columns.length
        let index = this.findingindex(inputelement, 'container')
        let row = index / (rowsLength + 1)
        let end = row * rowsLength
        let start = end - (rowsLength - 1)
        this.shadowRoot.styleSheets[0].cssRules[8].selectorText = `.item:nth-child(${index + 1})`
        this.shadowRoot.styleSheets[0].cssRules[7].selectorText = `::slotted(*:nth-child(n+${start}):nth-child(-n+${end}))`;
    }
    highlightingcells(cell) {
        this.selectedcell = cell
        let container = this.shadowRoot.querySelector('.container')
        let index = this.findingindex(cell, 'component')
        this.cellname = this.table.columns[(index % this.table.columns.length)].title
        let row = Math.ceil(index / this.table.columns.length)
        let cellrow = (row * (this.table.columns.length + 1))
        this.selectedrowno = (container.children[cellrow].innerHTML) / 1
        this.shadowRoot.styleSheets[0].cssRules[8].selectorText = `.nothing`
        this.shadowRoot.styleSheets[0].cssRules[7].selectorText = `::slotted(*:nth-child(${index + 1})`;
    }
    // highlightingcells = (e) => {
    //     // if (e.ctrlKey&&e.keyCode>=37&&e.keyCode<=40) {
    //     //     let main = this.shadowRoot.querySelector('.main')
    //     //     let keycode = e.keyCode
    //     //     let element;
    //     //     let columnlength = this.table.columns.length + 1
    //     //     e.preventDefault()
    //     //     if (keycode === 39) {
    //     //         element = e.path[0].nextElementSibling
    //     //     }
    //     //     else if (keycode === 37) {
    //     //         element = e.path[0].previousElementSibling
    //     //     } else if (keycode === 40 || keycode === 38) {
    //     //         let oldeleind = this.findingindex(e.path[0],'component')
    //     //         let neweleind;
    //     //         if (keycode === 40) {
    //     //             neweleind = oldeleind + columnlength
    //     //         } else {
    //     //             neweleind = oldeleind - columnlength
    //     //         }
    //     //         element = this.children[neweleind]
    //     //         let top = element.getBoundingClientRect().top
    //     //         if (top > 580) {
    //     //             main.scrollBy(0, 20)
    //     //         } else if (top < 10) {
    //     //             main.scrollBy(0, -20)
    //     //         }
    //     //     }
    //     //     if (element.getAttribute('type') === 'cells') {
    //     //         element.focus()
    //     //         let index = this.findingindex(element)
    //     //         this.shadowRoot.styleSheets[0].cssRules[7].selectorText = `::slotted(*:nth-child(${index + 1}))`;                
    //     //     }
    //     // }

    // }
    findingindex(e, parent) {
        let att = e.hasAttribute('type')
        if (att) {
            let parentele;
            if (parent === 'component') {
                parentele = this
            } else {
                parentele = this.shadowRoot.querySelector('.container')
            }
            let childs = parentele.children;
            let array = Array.from(childs)
            let index = array.indexOf(e);
            return index;
        }
    }
    generatingElements(elementobj) {
        let element = this.CreatingElement(elementobj.name)
        for (let key in elementobj) {
            if (key !== 'name' && key !== 'content') {
                element.setAttribute(`${key}`, `${elementobj[key]}`)
            } else if (key === 'content') {
                element.innerHTML = elementobj[key]
            }
        }
        return element
    }
    connectedCallback() {
        this.tableheight = this.getAttribute('tableheight')
        let data = this.getAttribute('data')
        this.table = JSON.parse(data)
        this.CreatingColumns()
        this.Rowheight = this.getAttribute('rowheight')
        document.styleSheets[0].cssRules[1].style.gridAutoRows = `${this.Rowheight}px`
        let lengthOfRows = this.table.rows.length
        let overall = this.shadowRoot.querySelector('.overall')
        overall.style.height = this.tableheight + 'px'
        this.shadowRoot.querySelector('.dummy').style.height = (this.Rowheight * lengthOfRows) + 20 + 'px'
        this.NoOfRowsforBlock = Math.floor((this.tableheight / this.Rowheight))
        this.TotalNoOfBlocks = Math.ceil((lengthOfRows / this.NoOfRowsforBlock))
        for (let i = 1; i <= 3; i++) {
            this.renderingRowsForward(i, false)
        }
        let main = this.shadowRoot.querySelector('.main')
        main.addEventListener('scroll', this.MainElementScrolling)
        overall.addEventListener('click', this.highlighting)
        overall.addEventListener('scroll', this.overallElementScrolling)
        overall.addEventListener('keydown', this.highlightingcells)
    }
}
customElements.define("table-component", mycomponent)