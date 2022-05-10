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
}
.item{
    border: 1px solid #dedede;
    height: 20px;
    text-align: center;   
    outline: none;     
}   
.header{
    background-color: #fff;
    position: sticky;
    top: 0;
}
.dummy{
    height: 20px;}    
.overall{
    overflow-y: auto;
    width: 100%;   
    display:flex;
}
</style>
<div class='overall'>
<div class="main" >
    <div class="container"></div>
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
            NewObject[x.title] = this.generating(x)
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
    currentBlocks = []
    previousscrorllheight=0
    currentscrollheight=0
    perviousscrolltop=0
    currentscrolltop=0
    BlocksUntilGenerated=[]
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
        if (!this.currentBlocks.includes(number)) {
            let end = number * this.NoOfRowsforBlock
            let start = end - this.NoOfRowsforBlock
            let rows = this.table.rows
            this.block = number
            this.currentBlocks.push(number)            
            if (removeelement) {
                this.currentBlocks.shift()
                this.preblock = number - 2
            }
            this.previousscrorllheight=container.scrollHeight-20
            for (let i = start; i < end; i++) {
                if (rows[i] !== undefined) {
                    let serialElement = this.CreatingElement('div')
                    serialElement.innerHTML = i + 1
                    container.appendChild(serialElement)
                    let column = this.table.columns
                    column.forEach(x => {
                        let name = x.title
                        let value = rows[i][name]
                        let cells = this.CreatingElement(x.componentName)
                        cells.innerHTML = value
                        container.appendChild(cells)
                    })
                } else {
                    break
                }
            }
            if(!this.BlocksUntilGenerated.includes(number)){              
                this.BlocksUntilGenerated.push(number)               
                this.currentscrollheight=container.scrollHeight-20
                let height=this.currentscrollheight-this.previousscrorllheight               
                this.settingHeight(height) 
                this.shadowRoot.querySelector('.overall').scrollTop=this.preblock*this.table.tableHeight            
            }
        }
    }
    renderingRowsBackward(number) {
        let main=this.shadowRoot.querySelector('.main')
        let container = this.shadowRoot.querySelector('.container')
        if (!this.currentBlocks.includes(number)) {            
            let end = number * this.NoOfRowsforBlock
            let start = end - this.NoOfRowsforBlock            
            let rows = this.table.rows
            this.currentBlocks.unshift(number)
            this.currentBlocks.pop()
            this.preblock=number
            this.block=number+2
            let columns_length = this.table.columns.length
            let insertingElement = container.childNodes[columns_length + 1]
            for (let i = start; i<end; i++) {               
                let serialElement = this.CreatingElement('div')
                serialElement.innerHTML = i + 1
                container.insertBefore(serialElement, insertingElement)
                let column = this.table.columns
                column.forEach(x => {
                    let name = x.title
                    let value = rows[i][name]
                    let cells = this.CreatingElement(x.componentName)
                    cells.innerHTML = value
                    container.insertBefore(cells, insertingElement)

                })
            }
            main.scrollTop=this.table.tableHeight
        }
    }
    MainElementScrolling = () => {
        var main = this.shadowRoot.querySelector('.main');
        let overall=this.shadowRoot.querySelector('.overall')
        var scrollheight = main.scrollHeight;
        var clientheight = main.clientHeight;
        var scrolltop = main.scrollTop;
        var bottom = scrollheight - clientheight;
        if (bottom === scrolltop) {
            if (this.block < this.TotalNoOfBlocks) {
                this.CheckingGenratedBlocks(this.block, 'forward')
                this.RemovingTopMostElements()
            }
        } else if (scrolltop === 0) {
            if (this.preblock > 1) {
                this.CheckingGenratedBlocks(this.preblock, 'backward')
                this.RemovingDownMostElement()
            }
        }else{
            this.settingSrollTop(main.scrollTop)
        }
    }
    settingSrollTop(inputtop){
        let overall=this.shadowRoot.querySelector('.overall')        
        let main=this.shadowRoot.querySelector('.main')
        let Overallscrolltop=Math.floor(overall.scrollTop)
        let Mainscrolltop=Math.floor(main.scrollTop)
        this.currentscrolltop+=Mainscrolltop
                
    }
    RemovingTopMostElements() {
        let column = this.table.columns
        let elementIndex = column.length + 1
        let container = this.shadowRoot.querySelector('.container')
        for (let i = 1; i <= this.NoOfRowsforBlock; i++) {
            container.childNodes[elementIndex].remove()
            column.forEach(x => {
                container.childNodes[elementIndex].remove()
            })
        }
    }
    RemovingDownMostElement(){
        let container=this.shadowRoot.querySelector('.container')
        let columns_length=this.table.columns.length+1
        let NoOfchildForThreeBlocks=(this.NoOfRowsforBlock*3)*columns_length+columns_length        
        let totalNoOfChildrens=container.childElementCount
        for(let i=0;i<totalNoOfChildrens-2;i++){
            if(container.childNodes[NoOfchildForThreeBlocks]){
                container.childNodes[NoOfchildForThreeBlocks].remove()
            }           
        }        
    }
    settingHeight(inputheight){
        let element=this.shadowRoot.querySelector('.dummy')
        let computed=getComputedStyle(element)
        let height=computed.getPropertyValue('height').replace('px','')        
        element.style.height=((height)/1+inputheight)+'px'
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
    connectedCallback() {
        this.generaterows(10000)
        this.CreatingColumns()
        this.CheckingTableHeight()
        let tableHeight = this.table.tableHeight
        this.shadowRoot.querySelector('.overall').style.height = tableHeight + 'px'
        this.NoOfRowsforBlock = Math.floor((tableHeight / 100) * 5)
        this.TotalNoOfBlocks = Math.ceil((this.table.rows.length / this.NoOfRowsforBlock))
        for (let i = 1; i <= 3; i++) {
            this.renderingRowsForward(i, false)
        }
        let main = this.shadowRoot.querySelector('.main')
        main.addEventListener('scroll', this.MainElementScrolling)
    }
}
customElements.define("table-component", mycomponent)


