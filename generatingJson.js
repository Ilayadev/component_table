let table = {    
    columns: [
        {
            title: 'Id',
            type: 'number',                
        },
        {
            title: 'Name',
            type: 'string',                
        },
        {
            title: 'Age',
            type: 'number',               
        },
        {
            title: 'Gender',
            type: 'string',               
        },
        {
            title: 'Date',
            type: 'date',
            
        }, {
            title: 'Attendance',
            type: 'boolean',               
        }
    ],
    rows: [
    ]
}
function generatetext() {
    var random = Math.floor(Math.random() * 10);
    return 'text' + random;
};
function generatenumber(x) {
    var random;
    if (x === 'id') {
        random = '#' + (Math.floor(Math.random() * 10) + 5000);
    } else {
        random = Math.floor(Math.random() * 10);
    }
    return random;
};
function generatedate() {
    var day = Math.floor(Math.random() * 31);
    var month = new Date().getMonth();
    var year = new Date().getFullYear();
    return `${day}/${month}/${year}`
};
 function generateboolean() {
    var arr = ['true', 'false']
    var random = Math.floor(Math.random() * 2);
    var value = arr[random]
    return value;
};
function generating(data) {
    
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
function creatingdata(MetaObject) {
    let columns = MetaObject.columns   
    let NewObject = {}
    columns.forEach(x => {
        let elementobj={}
        elementobj['name']='div'
        elementobj['class']='item'
        elementobj['content']=this.generating(x)
        NewObject[x.title] = elementobj
    });
    MetaObject.rows.push(NewObject)
}
function generaterows(NoOfRows) {
    for (var i = 1; i <= NoOfRows; i++) {
        this.creatingdata(table);
    }
}
generaterows(1000)