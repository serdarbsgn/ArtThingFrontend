<template>
  <header>
    <nav>
      <ul class="navbar">
        <li><a href="#" @click.prevent="pushHome">Home</a></li>
        <li ref="other"><a @click.prevent="toggleOtherDropdown" @blur="dropdownOtherHide" tabindex="0" href="#">Others</a></li>
        <li><a href="#" @click.prevent="pushGames">Games</a></li>
        <li><a href="#" @click.prevent="pushGyrowheel">GyroWheel APP</a></li>
        <li><a href="/vue">Projects</a></li>
        <li v-if="username">
          <img :src="picture" alt="Profile Picture" class="profile-pic" ref="pp" @click.prevent="toggleUserDropdown"
            @blur="dropdownUserHide" tabindex="0">
        </li>
        <template v-if="!username">
          <li><a ref="login" href="#" @click.prevent="toggleLoginDropdown"
            @blur="dropdownLoginHide" tabindex="0">Login</a></li>
          <li><a href="#" @click.prevent="register">Register</a></li>
        </template>
      </ul>
      <div v-if="username" v-show="dropdownUserVisible">
        <ul class="dropdown-menu" ref="dropdownUser">
          <li><a href="#" @click.prevent="pushUser">{{ username }}</a></li>
          <li><a href="#" @click.prevent="pushCart">Your Cart</a></li>
          <li><a href="#" @click.prevent="pushOrders">Your Orders</a></li>
          <li><a href="#" @click.prevent="logout">Logout</a></li>
        </ul>
      </div>
      <div v-show="dropdownOtherVisible">
        <ul class="dropdown-menu" ref="dropdownOther">
          <li><a href="#" @click.prevent="pushCanvasHome">Home??</a></li>
          <li><a href="#" @click.prevent="pushForum">Forum</a></li>
          <li><a href="#" @click.prevent="pushMarket">Marketplace (Not Real)</a></li>
          <li><a href="/docs">Api Docs</a></li>
        </ul>
      </div>
      <div v-show="dropdownLoginVisible">
        <ul class="dropdown-menu" ref="dropdownLogin">
          <LoginView :redirectOnLogin="false" />
        </ul>
      </div>
    </nav>
  </header>
</template>

<script>
import LoginView from './LoginView.vue';
import { username,picture,getUserinfo, logout } from '@/utils/helpers';
export default {
  name: "HeaderView",
  components: { LoginView, },
  data() {
    return {
      username,
      picture,
      dropdownUserVisible: false,
      dropdownOtherVisible: false,
      dropdownLoginVisible:false
    };
  },watch: {
    async username() {
      this.dropdownLoginVisible=false;
    }
  },
  methods: {
    async home() {
      await getUserinfo();
    },
    toggleUserDropdown() {
      this.dropdownUserVisible = !this.dropdownUserVisible;
      this.relocateUserDropdown();
    },
    dropdownUserHide() {
      setTimeout(() => {
        this.dropdownUserVisible = false;
      }, 200);
    },
    pushForum() {
      this.$router.push({ name: "ForumList" })
    },
    pushCart() {
      this.$router.push({ name: "CartView" })
    },
    pushOrders() {
      this.$router.push({ name: "OrderView" })
    },
    pushMarket() {
      this.$router.push({ name: "MarketView" })
    },
    pushHome() {
      this.$router.push({ name: 'Home' });
    },
    pushUser() {
      this.$router.push({ name: 'User' });
    },
    pushGyrowheel() {
      this.$router.push({ name: 'Gyrowheel' });
    },
    pushGames(){
      this.$router.push({ name: 'GameList' });
    },pushCanvasHome(){
      this.$router.push({name:"CanvasHome"});
    },
    relocateUserDropdown() {
      const profilePic = this.$refs.pp;
      if (profilePic) {
        let pp = profilePic.getBoundingClientRect();
        this.$refs.dropdownUser.style.left = `${pp.x}px`;
      }
    },
    toggleOtherDropdown() {
      this.dropdownOtherVisible = !this.dropdownOtherVisible;
      this.relocateOtherDropdown();
    },
    dropdownOtherHide() {
      setTimeout(() => {
        this.dropdownOtherVisible = false;
      }, 200);
    },
    relocateOtherDropdown() {
      const other = this.$refs.other;
      if (other) {
        let o = other.getBoundingClientRect();
        this.$refs.dropdownOther.style.left = `${o.x}px`;
        this.$refs.dropdownOther.style.width = `${o.width}px`;
      }
    },
    toggleLoginDropdown() {
      this.dropdownLoginVisible = !this.dropdownLoginVisible;
      this.relocateLoginDropdown();
    },
    dropdownLoginHide() {
      // setTimeout(() => {
      //   this.dropdownLoginVisible = false;
      // }, 200);
    },
    relocateLoginDropdown() {
      const login = this.$refs.login;
      if (login) {
        let l = login.getBoundingClientRect();
        this.$refs.dropdownLogin.style.left = `${l.x}px`;
      }
    },
    async logout() {
      logout();
    },
    login() {
      this.$router.push({ name: 'Login' })
    },
    register() {
      this.$router.push({ name: 'Register' })
    },
  },
  mounted() {
    this.home();

  }
};
</script>

<style scoped>
header {
  width: 100%;
  padding: 10px 20px;
  background-color: #333;
  border-radius: 50px;
}

.navbar {
  display: flex;
  justify-content: space-evenly;
  padding: 0;
  list-style: none;
  overflow: auto;
}

nav li {
  flex: 1;
  text-align: center;
  position: relative;
}

nav a {
  color: white;
  text-decoration: none;
  padding: 12px 15px;
  display: block;
  border-radius: 50px;
}

nav img {
  max-width: 50px;
  cursor: pointer;
}

::-webkit-scrollbar {
  height: 6px;
  background-color: #383838;
}

::-webkit-scrollbar-thumb {
  background-color: #4d4d4d;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #6e6e6e;
}

.dropdown-menu {
  position: absolute;
  background-color: #444;
  border: 1px solid #666;
  padding: 10px;
  z-index: 10;
  border-radius: 10px;
}

.dropdown-menu li {
  display: block;
}

.dropdown-menu li a {
  padding: 10px;
}

nav li:hover .dropdown-menu {
  display: block;
}
</style>