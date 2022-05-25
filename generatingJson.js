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
            title: 'Attendance',
            type: 'boolean',               
        }
    ],
    rows: [
    ]
}
function generatetext(title) {
    let value;
    if(title==='Gender'){
        var arr = ['male', 'female']
        var random = Math.floor(Math.random() * 2);
        value = arr[random]
    }else{
        var random = Math.floor(Math.random() * 10);
        value='text'+random
    }
    
    return value;
};
function generatenumber(x) {
    var random;
    if (x === 'Id') {
        random =  (Math.floor(Math.random() * 10) + 5000);
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
        return this.generatetext(data.title)
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
        // let elementobj={}
        // elementobj['name']='div'
        // elementobj['class']='item'
        // elementobj['content']=this.generating(x)
        NewObject[x.title] = this.generating(x)
    });
    MetaObject.rows.push(NewObject)
}
function generaterows(NoOfRows) {
    for (var i = 1; i <= NoOfRows; i++) {
        this.creatingdata(table);
    }
}
generaterows(1000)