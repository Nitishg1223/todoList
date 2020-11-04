//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://<username>:<password>@cluster0.v3vvn.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology:true});
const itemSchema= new mongoose.Schema({
  name:String
});
const listSchema= {
  name:String,
  items:[itemSchema]
};
const List= new mongoose.model("list",listSchema);
const  Item= new mongoose.model("Item", itemSchema);
const item1= new Item({
  name:"Welcome to todo list"
});
const item2= new Item({
  name:"Hit the + button to add a new task"
});
const item3= new Item({
  name:"<-- Hit this to delete an item:"
});
const defaultItems=[item1,item2,item3];


const day = date.getDate();
app.get("/", function(req, res) {


Item.find({},function(err,founditems){
  if(founditems.length==0){
    Item.insertMany(defaultItems,function(err){});
    res.redirect("/");
  }
    res.render("list", {listTitle: day, newListItems:founditems});
});


});

app.post("/", function(req, res){
 var listName=req.body.list;
 var itemName=req.body.newItem;
 var item =new Item ({
   name: itemName,

 });
if(listName===day)
{
item.save();
res.redirect("/");
}
else{

  List.findOne({name:listName},function(err,foundlist){
    foundlist.items.push(item);
    foundlist.save();
  });
  res.redirect("/"+listName);
}
});
app.post("/delete",function(req,res){
  const listName=req.body.listname;
  const itemId=req.body.checkbox;
  if(listName===day)
  {
    Item.deleteOne({_id:itemId},function(err){});
    res.redirect("/");
  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemId}}},function(err,foundList){
      if(!err)
      res.redirect("/"+listName);
    });


  }


});

app.get("/:listName",function(req,res){
  const listName=req.params.listName;
const day = date.getDate();
  List.findOne({name:listName},function(err,foundlist){
    if(!foundlist)
    {
      const list =new List({
        name:listName,
        items:defaultItems
      });
      list.save();
res.redirect("/"+listName);
    }
    else
    {
      res.render("list",{listTitle: foundlist.name, newListItems:foundlist.items});
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
