// dev version of a bookmarklet that more or less just loads a script
// in the page and runs it
javascript: (function() {
    function l(u, i, t, b) {
        var d = document;
        if (!d.getElementById(i)) {
            var s = d.createElement('script');
            s.src = u;
            s.id = i;
            d.body.appendChild(s)
        }
        s = setInterval(function() {
            u = 0;
            try {
                u = t.call()
            } catch(i) {}
            if (u) {
                clearInterval(s);
                b.call()
            }
        },
        200)
    }
    l('http://localhost:3000/javascripts/select.js', 'h8_select',
    function() {
        return !! (typeof H8CloudSelector == 'function')
    },
    function() {
        H8CloudSelector()
    })
})();
