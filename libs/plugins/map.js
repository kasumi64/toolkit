function Map() {
    var items = {};
    this.has = function(key){
        return key in items;
    },
    this.set = function(key,value){
        items[key] = value;
    },
    this.remove = function(key){
        if (this.has(key)) {
            delete items[key];
            return true;
        }
        return false;
    },
    this.get = function(key){
        return this.has(key)?items[key]:undefined;
    },
    this.values = function(){
        var values = [];
        for(var k in items){
            if (this.hasOwnProperty(k)) {
                values.push(items[k]);
            }
        }
        return values;
    },
    this.clear = function(){
        items = {};
    },
    this.size = function(){
        return Object.Keys(items).length;
    },
    this.getItems = function(){
        return items;
    }
}