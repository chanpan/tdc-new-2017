/** Utils **/
const utils = require("../utils/Utils.js");
const knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: utils.HomePath()+"/tdc/tdc.db"  
    },
    useNullAsDefault: true
});

/** reactive programming **/
var Observable = require('rxjs/Observable').Observable;
require('rxjs/add/observable/of');
require('rxjs/add/operator/map');
/* Tables */
exports.CreateTable=function(tables, columns=[], primarys=[],types='longtext',collates='utf8_unicode_ci', autoIncrement=''){
  /** Example
     unique =['fname']
     primary = ['id','fname']
     columns = ['id','fname','lname'] 
   **/
  return knex.schema.createTable(tables, function (table) {
    if(primarys.length > 0){
        for(let i of primarys){ SetPrimary(table, i); }
    }else{
      primarys = "id";
       SetPrimary(primarys);
    }
    if(autoIncrement != ""){
       SetAutoIncrement(autoIncrement);
    }
    for(let i of columns){
        table.text(i,types).collate(collates).comment(i).nullable();
    }
  });
}
exports.CreateTableIfNotExist=function(tables, columns=[], primarys=[],types='longtext',collates='utf8_unicode_ci', autoIncrement=''){
  /** Example
     unique =['fname']
     primary = ['id','fname']
     columns = ['id','fname','lname'] 
   **/
  return knex.schema.createTableIfNotExists(tables, function (table) {
    if(primarys.length > 0){
        for(let i of primarys){ SetPrimary(table, i); }
    }else{
      primarys = "id";
       SetPrimary(primarys);
    }
    if(autoIncrement != ""){
       SetAutoIncrement(autoIncrement);
    }
    for(let i of columns){
        table.text(i,types).collate(collates).comment(i).nullable();
    }
  });
}
exports.DropTable=function(tables=[]){
  for(let i of tables){
    return knex.schema.dropTable(i);
  }
}
exports.knexDropTableIfExists=function(tables){
  for(let i of tables){
    return knex.schema.dropTableIfExists(i);
  }
}

/* Columns */
exports.GetColumn=function(tables){
  return knex.schema.dropTableIfExists(tables);
}
exports.AddColumn=function(tables,columns=[],types='longtext', collates='utf8_unicode_ci'){
  /* example columns = ['id','name'] */
  return knex.schema.alterTable(tables, function(table) {
    for(let i of columns){
        table.text(i,types).collate(collates).comment(i).nullable();
    }
  });
}
exports.RenameColum=function(tables,columns, to){
  return knex.schema.alterTable(tables, function(table){
    for(let i of columns){
      table.renameColumn(i, to);
    }
  });
}
exports.DropColumn=function(tables, columns=[],types){
  /* example columns = ['id','name'] */
  return knex.schema.alterTable(tables, function(table) {
    for(let i of columns){
        table.dropColumn(i);
    }
  });
}
exports.SetUnique=function(tables, columns=[]){
  return knex.schema.alterTable(table, function(table) {
    
  });
}

/** CRUD **/
exports.Create=function(tables,datas){
  /** Example  tables={fname:'nuttaphon', lname:'chanpan' }*/
  return knex.insert(datas).into(tables);
}
exports.Read=function(table,datas,limit="unlimit"){
    /** 
     * data={id:1}
    */
    if(limit == "unlimit"){
      limit = "";
    }

    return new Observable(ob => {
      knex.select('*').from(table).where(datas).limit(limit).map(row=>ob.next(row)).catch(err=>ob.error(err));
    });
}
 
exports.ReadPromise=function(table,datas,limit="unlimit"){
  /** 
   * data={id:1}
  */
  if(limit == "unlimit"){
    limit = "";
  }
 
  return  knex.select('*').from(table).where(datas).limit(limit).map(row=>row=row).catch(err=>err=err);
 
}
exports.Update=function(tables,datas,whereColumn,operator,value){
  /**
   * table=user
   * data={username:'admin'}
   * where={id:1}
   **/
  return knex(tables).where(whereColumn, operator, value).update(datas);
  //return knex(table).where(where).update(datas);
}
exports.Delete=function(tables,wheres){
  /** 
   * table='users'
   * where = {id:1}
  */
  return knex(tables).where(wheres).del(); 
}

function SetPrimary(table, field){
   return table.primary(field)
}
function SetAutoIncrement(name){
  return table.increments(name);
}