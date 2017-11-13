const SignIn = { 
    template: `<transition name="modal">
    <div class="modal-mask">
        <div class="modal-wrapper">
            <div class="modal-container">
                <div class="modal-header">
                    <h4>Login</h4>
                </div>
                <div class="modal-body">
                    <input type="email" name="email" placeholder="Email" v-model="email">
                    <input type="password" name="password" placeholder="Password" v-model="password">
                    <input type="submit" v-on:click="login">
                </div>
                <ul class="sublinks">
                    <li>
                        <router-link to="/SignOn">Not registered?</router-link>
                    </li>    
                    <li>
                        <router-link to="/Forget">Forgot your password?</router-link>
                    </li>    
                </ul>    
            </div>
        </div>
    </div>
</transition>`,
    data() {
        return {
            email: '',
            password: '',
            submitted: ''
        }
    },
    methods: {
        login: function() {
            self = this;
            axios.post('/login', {email: this.email, password: this.password})
            .then(function (response) {
                this.$cookies.set('token', response.data.token, '7D');
                router.push('/');
            })
            .catch(function (error) {
                self.email = "wrong username or password";
            })    
        }
    }
}

const SignOn = {
    template: `<transition name="modal">
        <div class="modal-mask">
            <div class="modal-wrapper">
                <div class="modal-container">
                    <div class="modal-header">
                        <h4>Registering new user</h4>
                    </div>
                    <div class="modal-body">
                        <input type="text" name="name" placeholder="Name" v-model="register.name">
                        <input type="email" name="email" v-bind:placeholder="email" v-model="register.email">
                        <input type="password" name="password" placeholder="Password" v-model="register.password">
                        <input type="submit" v-on:click="postUser">
                    </div>
                    <div class="modal-footer">
                        <div class="sublink">
                            <router-link to="/SignIn">Already have account?</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>`,
    data() {
        return {
            register: {
                name: ''
                , email: ''
                , password: ''
            },
            email: "Email"
        }
    },
    methods: {
        postUser: function() {
            self = this;
            axios.post('/user', this.register )
                .then(function (response) {
                    router.push('/');
                })
                .catch(function (error) {
                    self.email = "already registered";
                    self.register.email = "";
                })
        }
        
    }
}

const Home = {
    template: `<div>
        <ul>
            <li v-if="users != null" v-for="user in users">
                {{ user.name }}: {{ user.email }}
            </li>
        </ul>
    </div>
    `,
    data() {
        return {
          users: []
        }
    },
    mounted() {
        this.getAllUsers()
    },
    methods: {
        getAllUsers (context) {
            axios.get('/users', {
              headers: {
                'Authorization': `Bearer ${this.$cookies.get('token')}`
              }
            }).then(({data}) => (this.users = data))
            .catch(function (error) {
            });
          }
    }
}