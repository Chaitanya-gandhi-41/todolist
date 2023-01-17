//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Implementing moongose changes and linking to a database 

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/todolistdb",{useNewUrlParser: true});

const itemSchema = { 
  name: String
};

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name: "ADA FILE"
});
const item2 = new Item({
  name: "ADA PRINT"
});
const item3 = new Item({
  name: "ADA SEND"
});

const defaultItems =[item1, item2, item3];


app.get("/", function(req, res) {


const day = date.getDate();
Item.find({},function(err,foundItems){
    // items.forEach(work=> console.log(work.name));
if(foundItems.length===100){
Item.insertMany(defaultItems,function(err){
  if(err){
    console.log(err)
  }
  else{
    console.log("Success");
  }
});
   res.redirect("/");
    }
    else{

      res.render("list", {listTitle: day, newListItems: foundItems});
    }
})



}); 

const listSchema = { 
  name: String,
  items: [itemSchema],
}

const List = mongoose.model("List",listSchema);

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList){
      //  create a new list
        const list = new List({
    name: customListName,
    items: defaultItems
  });
  list.save();
  res.redirect("/"+customListName);
      }else{
      //  show an existing list 
      res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname= req.body.list;

  const item = new Item({
    name: itemName
  });
  if(listname=== "Today"){

  item.save();
  res.redirect("/");
  }
  else{
    List.findOne({name: listname}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listname);
    })
  }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listname= req.body.listname;
  if(listname==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
      console.log(err)}
      else{
        console.log("success");
      }
      res.redirect("/")
    });
  }
  else{
    List.findOneAndUpdate({name: listname},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listname);
      }
    })

  }
})




app.listen(3000, function() {
  console.log("Server started on port 3000");
});



