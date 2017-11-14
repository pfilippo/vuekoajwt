const Koa = require('koa');
const Router = require('koa-router'); 
const bodyParser = require('koa-bodyparser'); 
const serve = require('koa-static'); 
const passport = require('koa-passport'); 
const LocalStrategy = require('passport-local'); 
const JwtStrategy = require('passport-jwt').Strategy; 
const ExtractJwt = require('passport-jwt').ExtractJwt; 
const jwtsecret = "mysecretkey"; 
const jwt = require('jsonwebtoken'); 
const crypto = require('crypto');
crypto.DEFAULT_ENCODING = 'hex';
const db = require('diskdb');
const dbu = db.connect('db', ['users']);

const app = new Koa();
const router = new Router();
app.use(serve('public'));
app.use(bodyParser());

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtsecret
  };
    
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false
  },
  function (email, password, done) {
    let checkUser = dbu.users.findOne({email: email});
    if (!checkUser) done(null, false, {message: 'Bad username or password'});
    else if (crypto.pbkdf2Sync(password, checkUser.salt, 1, 128, 'sha1') == checkUser.password) done(null, checkUser);
    else  done(null, false, {message: 'Bad username or password'});
  })
);

passport.use(new JwtStrategy(jwtOptions, function (payload, done) {
  let checkUser = dbu.users.findOne({email: payload.email});
  if (!checkUser) done(null, false);
  else done(null, checkUser);
  })
);

router.post('/user', (ctx, next) => {
    let newUser = ctx.request.body;
    let checkUser = dbu.users.findOne({email: newUser.email});
    if (!checkUser) {
        newUser.salt = crypto.randomBytes(128).toString('base64');
        newUser.password = crypto.pbkdf2Sync(newUser.password, newUser.salt, 1, 128, 'sha1');
        dbu.users.save(newUser);
        ctx.response.status = 200;
    }
    else {
        ctx.response.status = 418;
    }
});

router.post('/login', async(ctx, next) => {
    await passport.authenticate('local', function (err, user) {
      if (user) {
        let payload = {
          name: user.name,
          email: user.email
        };
        console.log(payload);
        const token = jwt.sign(payload, jwtsecret); 
        ctx.body = {user: user.Name, token: token}; //'JWT ' + 
      }  
      else {
        ctx.body = "Login failed";
        ctx.response.status = 418;        
      }
    })(ctx, next);  
  });

  router.get('/users', async(ctx, next) => {
    await passport.authenticate('jwt', function (err, user) {
      if (user) {
        let users = dbu.users.find();
        ctx.body = users.map(i => {
          return {name: i.name, email: i.email}
        });
      } else {
        ctx.body = "No such user";
        ctx.response.status = 418;
      }
    } )(ctx, next)  
  });

app.use(passport.initialize()); 
app.use(router.routes()); 

app.listen(process.env.PORT || 5000);