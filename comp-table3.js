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
}
.highlight{
    background-color: rgb(191, 240, 191);  
    border: 1px solid lightgreen;   
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
    table = {
        tableHeight: 600,
        columns: [
            {
                title: 'Id',
                type: 'number',
                componentName: 'div'
            },
            {
                title: 'Name',
                type: 'string',
                componentName: 'span'
            },
            {
                title: 'Age',
                type: 'number',
                componentName: 'p'
            },
            {
                title: 'Gender',
                type: 'string',
                componentName: 'i'
            },
            {
                title: 'Date',
                type: 'date',
                componentName: 'span'
            }, {
                title: 'Attendance',
                type: 'boolean',
                componentName: 'div'
            }
        ],
        rows: [
        ]
    }
    generatetext() {
        var random = Math.floor(Math.random() * 10);
        return 'text' + random;
    };
    generatenumber(x) {
        var random;
        if (x === 'id') {
            random = '#' + (Math.floor(Math.random() * 10) + 5000);
        } else {
            random = Math.floor(Math.random() * 10);
        }
        return random;
    };
    generatedate() {
        var day = Math.floor(Math.random() * 31);
        var month = new Date().getMonth();
        var year = new Date().getFullYear();
        return `${day}/${month}/${year}`
    };
    generateboolean() {
        var arr = ['true', 'false']
        var random = Math.floor(Math.random() * 2);
        var value = arr[random]
        return value;
    };
    generating(data) {
        if (data.type === 'string') {
            return this.generatetext()
        } else if (data.type === 'number') {
            return this.generatenumber(data.title);
        } else if (data.type === 'date') {
            return this.generatedate();
        } else {
            return this.generateboolean();
        }
    }
    creatingdata(MetaObject) {
        let columns = MetaObject.columns
        let NewObject = {}
        columns.forEach(x => {
            let element = this.CreatingElement('button')
            element.innerHTML = this.generating(x)
            NewObject[x.title] = element
        });
        MetaObject.rows.push(NewObject)
    }
    generaterows(NoOfRows) {
        for (var i = 1; i <= NoOfRows; i++) {
            this.creatingdata(this.table);
        }
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
    CreatingElement(NameOfElement) {
        let ele = document.createElement(NameOfElement)
        ele.classList.add('item')
        return ele
    }
    CheckingTableHeight() {
        if (!this.table.tableHeight) {
            this.table.tableHeight = 300
        }
    }
    renderingRowsForward(number, removeelement) {
        let container = this.shadowRoot.querySelector('.container')
        if (this.TotalNoOfBlocks >= number) {
            if (!this.currentBlocks.includes(number) && number !== 0) {
                let end = number * this.NoOfRowsforBlock
                let start = end - this.NoOfRowsforBlock
                let rows = this.table.rows
                this.block = number
                this.currentBlocks.push(number)
                this.preblock = number - 2
                for (let i = start; i < end; i++) {
                    if (rows[i] !== undefined) {
                        let serialElement = this.CreatingElement('div')
                        serialElement.setAttribute('type', 'row')
                        serialElement.style.height = this.Rowheight + 'px'
                        serialElement.innerHTML = i + 1
                        container.appendChild(serialElement)
                        let column = this.table.columns
                        column.forEach((x) => {
                            let name = x.title
                            let cells = rows[i][name]
                            cells.setAttribute('type', 'cells')
                            cells.setAttribute('tabindex', 1)
                            // let slot = this.CreatingElement('slot')
                            // slot.name=`${name}${i+1}`
                            container.appendChild(cells)
                            // cells.slot=`${name}${i+1}`  
                            cells.style.height = this.Rowheight + 'px'
                            // this.appendChild(cells)                            
                        })
                    } else break
                }
                if (removeelement) {
                    this.currentBlocks.shift()
                    this.RemovingTopMostElements()
                }
            }
        }
    }
    renderingRowsBackward(number) {
        let main = this.shadowRoot.querySelector('.main')
        let container = this.shadowRoot.querySelector('.container')
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
            for (let i = start; i < end; i++) {
                let serialElement = this.CreatingElement('div')
                serialElement.innerHTML = i + 1
                serialElement.style.height = this.Rowheight + 'px'
                serialElement.setAttribute('type', 'row')
                container.insertBefore(serialElement, insertingElement)
                column.forEach(x => {
                    let name = x.title
                    let cells = rows[i][name]
                    cells.setAttribute('type', 'cells')
                    cells.setAttribute('tabindex', 1)
                    // let slot = this.CreatingElement('slot')
                    // slot.name=`${name}${i+1}`                   
                    container.insertBefore(cells, insertingElement)
                    // cells.slot=`${name}${i+1}`
                    cells.style.height = this.Rowheight + 'px'
                    // this.appendChild(cells)

                })
            }
            this.RemovingDownMostElement()
            main.scrollTop = 600
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
            let scrolltop = Math.floor(overall.scrollTop)
            let scrollheight = overall.scrollHeight
            let clientheight = overall.clientHeight
            let bottom = scrollheight - clientheight
            this.checkingMainElement = true
            if (this.TotalNoOfBlocks > 3) {
                let block = Math.ceil(scrolltop / 600)
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
                    main.scrollTop = 1250
                } else if (scrolltop === 0) {
                    main.scrollTop = 0
                }
                else {
                    main.scrollTop = (this.scrollvariable * 600) + (scrolltop % 600)
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
            var scrolltop = Math.floor(main.scrollTop);
            this.checkingOverallElement = true
            if (this.TotalNoOfBlocks > 3) {
                if (scrolltop >= this.currentscrolltop) {
                    this.currentscrolltop = scrolltop
                    if (scrolltop === bottom) {
                        if (this.block < this.TotalNoOfBlocks) {
                            this.CheckingGenratedBlocks(this.block, 'forward')
                        }
                        if (this.block === this.TotalNoOfBlocks) {
                            overall.scrollTop = (this.preblock - 1) * 600 + (scrolltop)
                        }
                    }
                    else {
                        overall.scrollTop = (this.preblock - 1) * 600 + (scrolltop)
                    }
                } else {
                    this.currentscrolltop = scrolltop
                    if (scrolltop === 0) {
                        if (this.preblock > 1) {
                            this.CheckingGenratedBlocks(this.preblock, 'backward')
                        }
                        if (this.preblock === 1) {
                            overall.scrollTop = 0
                        } else {
                            setTimeout(() => {
                                main.scrollTop = 600
                            }, 18);
                        }

                    } else {
                        overall.scrollTop = (this.preblock - 1) * 600 + (scrolltop)
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
    }
    RemovingDownMostElement() {
        let container = this.shadowRoot.querySelector('.container')
        let columns_length = this.table.columns.length + 1
        let NoOfchildForThreeBlocks = (this.NoOfRowsforBlock * 3) * columns_length + columns_length
        let totalNoOfChildrens = container.childElementCount
        for (let i = 0; i < totalNoOfChildrens - 2; i++) {
            if (container.children[NoOfchildForThreeBlocks]) {
                container.children[NoOfchildForThreeBlocks].remove()
            }
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
        let index = this.findingindex(Element)
        let rowsLength = this.table.columns.length + 1
        if (attribute === 'column') {
            let columnNo = Element.getAttribute('columnNo') / 1 + 1
            this.shadowRoot.styleSheets[0].cssRules[7].selectorText = `.item:nth-child(${rowsLength}n+${columnNo})`;
        } else if (attribute === 'row') {
            let start = index + 1
            let end = (start + rowsLength) - 1
            this.shadowRoot.styleSheets[0].cssRules[7].selectorText = `.item:nth-child(n+${start}):nth-child(-n+${end})`;
        } else if (attribute === 'cells') {
            this.shadowRoot.styleSheets[0].cssRules[7].selectorText = `.item:nth-child(${index + 1})`;
        }
        this.Highlighted = attribute
    }
    highlightingcells = (e) => {       
        // if (e.ctrlKey&&e.keyCode>=37&&e.keyCode<=40) {
        //     let main = this.shadowRoot.querySelector('.main')
        //     let keycode = e.keyCode
        //     let element;
        //     let columnlength = this.table.columns.length + 1
        //     e.preventDefault()
        //     if (keycode === 39) {
        //         element = e.path[0].nextElementSibling
        //     }
        //     else if (keycode === 37) {
        //         element = e.path[0].previousElementSibling
        //     } else if (keycode === 40 || keycode === 38) {
        //         let oldeleind = this.findingindex(e.path[0])
        //         let neweleind;
        //         if (keycode === 40) {
        //             neweleind = oldeleind + columnlength
        //         } else {
        //             neweleind = oldeleind - columnlength
        //         }
        //         element = this.shadowRoot.querySelector('.container').children[neweleind]
        //         let top = element.getBoundingClientRect().top
        //         if (top > 580) {
        //             main.scrollBy(0, 20)
        //         } else if (top < 10) {
        //             main.scrollBy(0, -20)
        //         }
        //     }
        //     if (element.getAttribute('type') === 'cells') {
        //         element.focus()
        //         let index = this.findingindex(element)
        //         this.shadowRoot.styleSheets[0].cssRules[7].selectorText = `.item:nth-child(${index + 1})`;                
        //     }
        // }

    }
    findingindex(e) {
        let att = e.hasAttribute('type')
        if (att) {
            let parent = this.shadowRoot.querySelector('.container')
            let childs = parent.children;
            let array = Array.from(childs)
            let index = array.indexOf(e);
            return index;
        }
    }
    connectedCallback() {
        this.generaterows(1000)
        this.CreatingColumns()
        this.CheckingTableHeight()
        this.Rowheight = this.getAttribute('rowheight')
        document.styleSheets[0].cssRules[1].style.gridAutoRows = `${this.Rowheight}px`
        let lengthOfRows = this.table.rows.length
        let tableHeight = this.table.tableHeight
        let overall = this.shadowRoot.querySelector('.overall')
        overall.style.height = tableHeight + 'px'
        this.shadowRoot.querySelector('.dummy').style.height = (this.Rowheight * lengthOfRows) + 20 + 'px'
        this.NoOfRowsforBlock = Math.floor((tableHeight / this.Rowheight))
        this.TotalNoOfBlocks = Math.ceil((this.table.rows.length / this.NoOfRowsforBlock))
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


