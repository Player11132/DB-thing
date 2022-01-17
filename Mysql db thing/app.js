let mysql=require('mysql2');
const express = require("express");
const formidable = require('formidable');


const app = express();
const port = 5000;

// setup express
app.set("view engine","ejs");
app.use(express.static('public'));

let id=0;
let title='';
let completion = 0;

//setup conncetion with mysql
let connection = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: 'MihiDoesDB112.',
    database: 'todoapp'
})

connection.connect(function(err){
    if(err)
    {
        return console.error('error:'+err.message);
    }

    console.log('connected to MySQL '+connection.database+' database');
});

const sql = 'SELECT * FROM todos';
app.get("/", function(req,result){
connection.query(sql,(err,res,fields)=>{
    if(err)
    {
      return console.log(err.message);
    }

    console.log(res);
    //in acest vector vor ajunge toate informatile din basa de date
    var todoitem = [];

    //salvez toate datele int-o singura variabila care va fi trimisa catre .ejs
    res.forEach(element=> {
        todoitem.push({
          ID:element.id,
          title:element.title,
          completed:element.completed
        });
    });
    
    console.log(todoitem);

    result.render("html/index",{ui_todoitems:todoitem});
});


});

app.post("/addToDO", function (req, res) {
    var form = new formidable.IncomingForm();
    
    form.parse(req, function (err, fields, files) {
  
      var sql = "INSERT INTO todos (title,completed) " +
      "values ('" + fields.Content + "', '" + fields.Completed + ")";
  
      connection.query(sql, function (err, result, fields) {
        if(err)
        {
          return console.log(err.message);
        }
        console.log(result);
  
        console.log("to do item added");
        res.redirect('/');
      });
    });
  });

  app.post("/editToDo", function (req, res) {
    var form = new formidable.IncomingForm();
  
    form.parse(req, function (err, fields, files) {
  
      var sql = "UPDATE todoitem " +
      "SET title = '" + fields.title + "', compelted = '" + fields.completed + " WHERE ID = " + fields.id;
  
      connection.query(sql, function (err, result, fields) {
        if(err)
        {
          return console.log(err.message);
        }
        console.log(result);
  
        console.log("ToDoItem successfully updated!");
        res.redirect('/');
      });
    });
  });
  

app.listen(port, function(error) {
  if (error) {
      console.log("Something went wrong!", error);
  }
  else {
      console.log("Server is on port " + port);
  }
});

