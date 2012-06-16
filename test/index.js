// builtin
var assert = require('assert');

// 3rd party
var connect = require('connect');
var request = require('request');

// local
var yummy = require('..');

var app = connect();
app.use(connect.cookieParser());
app.use(yummy({
    secret: 'foobar'
}));

app.use('/increment', function(req, res) {
    if (!req.session.count) {
        req.session.count = 0;
    }
    res.end(++req.session.count + '');
});

app.use(function(req, res){
    // must add something to the session otherwise it won't be set
    req.session.foo = 'bar';

    res.end('hello world\n');
});

test('foo', function(done) {
    var server = app.listen(function() {
        var addr = server.address();
        var port = addr.port;
        request('http://localhost:' + port, function(err, res, body) {
            assert.ok(!err);

            var cookie = res.headers['set-cookie'][0];
            assert.equal(body, 'hello world\n');
            assert.equal(cookie, 'connect.sess=tCQ0y1kNJGxXyv8RHKd5UjaR7cSCXjGsrZWyAwvKIab%2fodGgLr0o9BCJ+KapqBKS; Path=/');

            server.close();
        });
    });

    server.on('close', function() {
        done();
    });
});

test('counter', function(done) {
    var server = app.listen(function() {
        var addr = server.address();
        var port = addr.port;
        request('http://localhost:' + port + '/increment', function(err, res, body) {
            assert.ok(!err);
            assert.equal(body, 1);
            request('http://localhost:' + port + '/increment', function(err, res, body) {
                assert.ok(!err);
                assert.equal(body, 2);

                server.close();
            });
        });
    });

    server.on('close', function() {
        done();
    });
});

