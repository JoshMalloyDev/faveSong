const ObjectId = require("mongodb").ObjectId

module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
      let music = [
        { album: "I Never Liked You", artist: "Future", src: "future.png"},
        { album: "Un Verano Sin Ti", artist: "Bad Bunny", src: "bad-bunny.png"},
        {
          album: "Mr. Morale & The Big Steppers",
          artist: "Kendrick Lamar",
          src: "kendrick.png"
        },
        {
          album: "Ramona Park Broke My Heart",
          artist: "Vince Staples",
          src: "vince.png"
        },
      ];
  
      db.collection('saved').find().toArray((err1,savedMusic)=>{
        db.collection('messages').find().toArray((err2, result) => {
          if (err2) return console.log(err2)
          res.render('profile.ejs', {
            user : req.user,
            music: music,
            savedMusic: savedMusic
          })
        })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/save', (req, res) => {
      console.log(req.body,'request sent to post route')
      db.collection('saved').insertOne({album: req.body.album, artist: req.body.artist, cover: req.body.cover}, 
        (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database', result)
        res.send({})
      })
    })

    app.put('/messages', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.delete('/deleteSave', (req, res) => {
      console.log(req.body, 'delete route')
      db.collection('saved').findOneAndDelete({_id: ObjectId(req.body.musicId)},
        function(err, result){
        if(err) return res.send(500, err)
        res.send(result)
      })

    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
