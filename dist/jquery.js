window.undefined = window.undefined;


function jQuery(a, c) {

    // Shortcut for document ready (because $(document).each() is silly)
    if (a && a.constructor == Function && jQuery.fn.ready)
        return jQuery(document).ready(a);


    a = a || jQuery.context || document;


    if (a.jquery)
        return $(jQuery.merge(a, []));


    if (c && c.jquery)
        return $(c).find(a);


    if (window == this)
        return new jQuery(a, c);

    // Handle HTML strings
    var m = /^[^<]*(<.+>)[^>]*$/.exec(a);
    if (m) a = jQuery.clean([m[1]]);

    // Watch for when an array is passed in
    this.get(a.constructor == Array || a.length && !a.nodeType && a[0] != undefined && a[0].nodeType ?
        // Assume that it is an array of DOM Elements
        jQuery.merge(a, []) :


        jQuery.find(a, c));

}

// Map over the $ in case of overwrite
if (typeof $ != "undefined")
    jQuery._$ = $;

// Map the jQuery namespace to the '$' one
var $ = jQuery;

jQuery.fn = jQuery.prototype = {

    jquery: "$Rev$",


    get: function(num) {
        // Watch for when an array (of elements) is passed in
        if (num && num.constructor == Array) {

            // Use a tricky hack to make the jQuery object
            // look and feel like an array
            this.length = 0;
            [].push.apply(this, num);

            return this;
        } else
            return num == undefined ?

                // Return a 'clean' array
                jQuery.map(this, function(a) {
                    return a
                }) :

                // Return just the object
                this[num];
    },

};


jQuery.extend = jQuery.fn.extend = function(obj, prop) {
    if (!prop) {
        prop = obj;
        obj = this;
    }
    for (var i in prop) obj[i] = prop[i];
    return obj;
};

jQuery.extend({


    expr: {
        "": "m[2]== '*'||a.nodeName.toUpperCase()==m[2].toUpperCase()",
        "#": "a.getAttribute('id')&&a.getAttribute('id')==m[2]",

    },


    find: function(t, context) {
        // Make sure that the context is a DOM Element
        if (context && context.nodeType == undefined)
            context = null;

        // Set the correct context (if none is provided)
        context = context || jQuery.context || document;

        if (t.constructor != String) return [t];

        var ret = [context];
        var done = [];
        var last = null;

        while (t.length > 0 && last != t) {
            var r = [];
            last = t;

            t = jQuery.trim(t).replace(/^\/\//i, "");

            var foundToken = false;

         

            if (!foundToken) {
                if (!t.indexOf(",") || !t.indexOf("|")) {
                    if (ret[0] == context) ret.shift();
                    done = jQuery.merge(done, ret);
                    r = ret = [context];
                    t = " " + t.substr(1, t.length);
                } else {
                    var re2 = /^([#.]?)([a-z0-9\\*_-]*)/i;
                    var m = re2.exec(t);

                    if (m[1] == "#") {
                        // Ummm, should make this work in all XML docs
                        var oid = document.getElementById(m[2]);
                        r = ret = oid ? [oid] : [];
                        t = t.replace(re2, "");
                    } else {
                        if (!m[2] || m[1] == ".") m[2] = "*";

                        for (var i = 0; i < ret.length; i++){
                        	var tmp;
                        	if(m[2]=="*"){
                        		tmp=jQuery.getAll(ret[i]);
                        	}else{
                        		tmp=ret[i].getElementsByTagName(m[2]);
                        	}

                            r = jQuery.merge(r,tmp);
                        }
                    }
                }

            }

            if (t) {
                var val = jQuery.filter(t, r);
                ret = r = val.r;
                t = jQuery.trim(val.t);
            }
        }

        if (ret && ret[0] == context) ret.shift();
        done = jQuery.merge(done, ret);

        return done;
    },


    filter: function(t, r, not) {
        return {
            r: r,
            t: t
        };
    },

    trim: function(t) {
        return t.replace(/^\s+|\s+$/g, "");
    },

    merge: function(first, second) {
        var result = [];

        // Move b over to the new array (this helps to avoid
        // StaticNodeList instances)
        for (var k = 0; k < first.length; k++)
            result[k] = first[k];

        // Now check for duplicates between a and b and only
        // add the unique items
        for (var i = 0; i < second.length; i++) {
            var noCollision = true;


            for (var j = 0; j < first.length; j++)
                if (second[i] == first[j])
                    noCollision = false;


            if (noCollision)
                result.push(second[i]);
        }

        return result;
    },



    event: {

        add: function(element, type, handler) {
            // Make sure that the function being executed has a unique ID
            if (!handler.guid)
                handler.guid = this.guid++;

            // Init the element's event structure
            if (!element.events)
                element.events = {};

            // Get the current list of functions bound to this event
            var handlers = element.events[type];

            // If it hasn't been initialized yet
            if (!handlers) {
                // Init the event handler queue
                handlers = element.events[type] = {};

                // Remember an existing handler, if it's already there
                if (element["on" + type])
                    handlers[0] = element["on" + type];
            }

            // Add the function to the element's handler list
            handlers[handler.guid] = handler;

            // And bind the global event handler to the element
            element["on" + type] = this.handle;

            // Remember the function in a global list (for triggering)
            if (!this.global[type])
                this.global[type] = [];
            this.global[type].push(element);
        },

        guid: 1,
        global: {},

        handle: function(event) {
            if (typeof jQuery == "undefined") return;

            event = event || jQuery.event.fix(window.event);

            // If no correct event was found, fail
            if (!event) return;

            var returnValue = true;

            var c = this.events[event.type];

            for (var j in c) {
                if (c[j].apply(this, [event]) === false) {
                    event.preventDefault();
                    event.stopPropagation();
                    returnValue = false;
                }
            }

            return returnValue;
        },



    }
});



jQuery.fn.extend({

    ready: function(f) {
        // If the DOM is already ready
        if (jQuery.isReady){
        // Execute the function immediately
            console.log("ready");
            f.apply(document);

        }

        // Otherwise, remember the function for later
        else {
            // Add the function to the wait list
            console.log("ready else");
            jQuery.readyList.push(f);
        }

        return this;
    }
});

jQuery.extend({

    isReady: false,
    readyList: [],

    // Handle when the DOM is ready
    ready: function() {
        // Make sure that the DOM is not already loaded
        if (!jQuery.isReady) {
            // Remember that the DOM is ready
            jQuery.isReady = true;

            // If there are functions bound, to execute
            if (jQuery.readyList) {
                // Execute all of them
                for (var i = 0; i < jQuery.readyList.length; i++)
                    jQuery.readyList[i].apply(document);

                // Reset the list of functions
                jQuery.readyList = null;
            }
        }
    }
});

new function() {
    jQuery.event.add(window, "load", jQuery.ready);
};
