const Forget = { template: '<div>forget</div>' }
const Logout = { template: '<div>logout</div>' }

const routes = [
  { path: '/', component: Home, meta: {requiredAuth: true} },
  { path: '/SignIn', component: SignIn },
  { path: '/SignOn', component: SignOn },
  { path: '/Forget', component: Forget },
  { path: '/Logout', component: Logout }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiredAuth) {
    if (this.$cookies.get('token')) next()
    else router.push('/SignIn')
  } 
  else next()
})

const app = new Vue({
  el:'#app',
  data: {
    user: {authenticated: false }
  },
  router
})

