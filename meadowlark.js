var express = require('express');
var fortune = require('./lib/fortune.js');
var formidable = require('formidable');
var jqupload = require('jquery-file-upload-middleware');

var app = express();

// set up handlebars view engine
//var handlebars = require('express3-handlebars').create({defaultLayout:'main' });
//var handlebars = require('express3-handlebars').create({ extname: '.hbs', defaultLayout:'main' });

var handlebars = require('express3-handlebars').create({
defaultLayout:'main',
helpers: {
section: function(name, options){
if(!this._sections) this._sections = {};
this._sections[name] = options.fn(this);
return null;
}
}
});

var tours = [
    { id: 0, name: 'Hood River', price: 99.99 },
    { id: 1, name: 'Oregon Coast', price: 149.95 },
];


function getWeatherData(){
return {
locations: [
{
    name: 'Portland',
    forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
    iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
    weather: 'Overcast',
    temp: '54.1 F (12.3 C)'
},
{
    name: 'Bend',
    forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
    iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
    weather: 'Partly Cloudy',
    temp: '55.0 F (12.8 C)'
},
{
    name: 'Manzanita',
    forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
    iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
    weather: 'Light Rain',
    temp: '55.0 F (12.8 C)'
}
]
};
}

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser')());

app.use('/upload', function(req, res, next){
    var now = Date.now();
    jqupload.fileHandler({
    uploadDir: function(){
        return __dirname + '/public/uploads/' + now;
    },
    uploadUrl: function(){
    return '/uploads/' + now;
    },
    })(req, res, next);
});

app.use(function(req, res, next){
    res.locals.showTests = app.get('env') !== 'production' &&
    req.query.test === '1';
    next();
});

app.use('npm install --save jquery-file-upload-middleware', function(req, res, next){
    var now = Date.now();
    jqupload.fileHandler({
    uploadDir: function(){
    return __dirname + '/public/uploads/' + now;
    },
    uploadUrl: function(){
    return '/uploads/' + now;
    },
    })(req, res, next);
});

app.set('port', process.env.PORT || 3000);
app.disable('x-powered-by');

app.get('/', function(req, res){
    res.render('home');
});

//app.get('/api/tours', function(req, res){
//    res.json(tours);
//});


app.get('/nursery-rhyme', function(req, res){
        res.render('nursery-rhyme');
    });
    app.get('/data/nursery-rhyme', function(req, res){
        res.json({
            animal: 'squirrel',
            bodyPart: 'tail',
            adjective: 'bushy',
            noun: 'heck',
        });
});


app.get('/newsletter', function(req, res){
    // we will learn about CSRF later...for now, we just
    // provide a dummy value
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});

//app.post('/process', function(req, res){
//    console.log('Form (from querystring): ' + req.query.form);
//    console.log('CSRF token (from hidden form field): ' + req.body._csrf);
//    console.log('Name (from visible form field): ' + req.body.name);
//    console.log('Email (from visible form field): ' + req.body.email);
//    res.redirect(303, '/thank-you');
//});

app.post('/process', function(req, res){
if(req.xhr || req.accepts('json,html')==='json'){
// if there were an error, we would send { error: 'error description' }
res.send({ success: true });
} else {
// if there were an error, we would redirect to an error page
res.send({ success: true });
res.redirect(303, '/thank-you');
}
});

app.get('/api/tours', function(req, res){
var toursXml = "asdasdasdasd12331312312awsdasdasdjghjghjghjgj";

//    var toursXml = '<?xml version="1.0"?><tours>' + products.map(function(p){
//        return '<tour price="' + p.price + '" id="' + p.id + '">' + p.name + '</tour>';
//    }).join('') + '</tours>';
//
//    var toursText = tours.map(function(p){
//        return p.id + ': ' + p.name + ' (' + p.price + ')';
//    }).join('\n');

    res.format({'application/json': function(){
                    res.json(tours);
                },
                'application/xml': function(){
                    res.type('application/xml');
                    res.send(toursXml);
                },
                'text/xml': function(){
                    res.type('text/xml');
                    res.send(toursXml);
                },
                'text/plain': function(){
                    res.type('text/plain');
                    res.send(toursXml);
                }
        });
});

// API that updates a tour and returns JSON; params are passed using querystring
app.put('/api/tour/:id', function(req, res){
    var p = tours.some(function(p){ return p.id == req.params.id });
    if( p ) {
        if( req.query.name ) p.name = req.query.name;
        if( req.query.price ) p.price = req.query.price;
        res.json({success: true});
    } else {
        res.json({error: 'No such tour exists.'});
    }
});
// API that deletes a product
app.delete('/api/tour/:id', function(req, res){
    var i;
    for( var i=tours.length-1; i>=0; i-- )
    if( tours[i].id == req.params.id ) break;
    if( i>=0 ) {
        tours.splice(i, 1);
        res.json({success: true});
    } else {
        res.json({error: 'No such tour exists.'});
    }
});


app.get('/headers', function(req,res){
    res.set('Content-Type','text/plain');
    var s = '';
    for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
    res.send(s);
});

app.get('/tours/hood-river', function(req, res){
    res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', function(req, res){
    res.render('tours/request-group-rate');
});

app.get('/about', function(req, res){
//    res.render('about');

//    var randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
//    res.render('about', { fortune: randomFortune });

    res.render('about', { fortune: fortune.getFortune(),
                          pageTestScript: '/qa/tests-about.js'
                        });
});


app.get('/contest/vacation-photo',function(req,res){
    var now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(), month: now.getMonth()
    });
});

app.post('/contest/vacation-photo/:year/:month', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
        if(err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});


// the following layout doesn't have a layout file, so views/no-layout.handlebars
// must include all necessary HTML
app.get('/no-layout', function(req, res){
    res.render('no-layout', { layout: null });
});

app.get('/test', function(req, res){
    res.type('text/plain');
    res.send('this is a test');
});

// the layout file views/layouts/custom.handlebars will be used
app.get('/custom-layout', function(req, res){
    res.render('custom-layout', { layout: 'custom' });
});

//app.get('/greeting', function(req, res){
//    res.render('about', {
//        message: 'welcome',
//        style: req.query.style,
//        userid: req.cookie.userid,
//        username: req.session.username,
//    });
//});

// body-parser middleware must be linked in
app.post('/process-contact', function(req, res){
    console.log('Received contact from ' + req.body.name + ' <' + req.body.email + '>');
    // save to database....
    res.redirect(303, '/thank-you');
});

// custom 404 page
app.use(function(req, res, next){
    res.status(404);
    res.render('404');
});
// custom 500 page
app.use(function(err, req, res, next){
//    console.error(err.stack);
//    res.type('text/plain');
//    res.status(500);
//    res.send('500 - Server Error');
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
    console.log( 'Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.' );
});

//if( app.thing == null ) console.log( 'bleat!' );


///This will render the view with layout views/layouts/microsite.handlebars.
//app.get('/foo', function(req, res){
//    res.render('foo', { layout: 'microsite' });
//});

app.use(function(req, res, next){
if(!res.locals.partials) res.locals.partials = {};
//res.locals.partials.weather = getWeatherData();
partials.weather.locations = [
                                               {
                                                   name: 'Portland',
                                                   forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                                                   iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                                                   weather: 'Overcast',
                                                   temp: '54.1 F (12.3 C)'
                                               },
                                               {
                                                   name: 'Bend',
                                                   forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                                                   iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                                                   weather: 'Partly Cloudy',
                                                   temp: '55.0 F (12.8 C)'
                                               },
                                               {
                                                   name: 'Manzanita',
                                                   forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                                                   iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                                                   weather: 'Light Rain',
                                                   temp: '55.0 F (12.8 C)'
                                               }];

next();
});

