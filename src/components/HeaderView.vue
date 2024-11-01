<template>
  <header>
    <nav>
      <ul class="navbar">
        <li><a href="#" @click.prevent="pushHome" >Home</a></li>
        <li ref="other"><a @focus="toggleOtherDropdown" @blur="dropdownOtherHide" tabindex="0" href="#">Other</a></li>
        <li><a href="/games">Games</a></li>
        <li><a href="/gyrowheel_app">GyroWheel APP</a></li>
        <li><a href="/vue">Projects</a></li>
        <li v-if="username">
          <img :src="picture" alt="Profile Picture" class="profile-pic" ref="pp" @focus="toggleUserDropdown"
            @blur="dropdownUserHide" tabindex="0">
        </li>
        <template v-if="!username">
          <li><a href="#" @click.prevent="login">Login</a></li>
          <li><a href="#" @click.prevent="register">Register</a></li>
        </template>
      </ul>
      <div v-if="username" v-show="dropdownUserVisible">
        <ul class="dropdown-menu" ref="dropdownUser">
          <li><a href="/user">{{ username }}</a></li>
          <li><a href="/cart">Your Cart</a></li>
          <li><a href="/orders">Your Orders</a></li>
          <li><a href="#" @click.prevent="logout">Logout</a></li>
        </ul>
      </div>
      <div v-show="dropdownOtherVisible">
        <ul class="dropdown-menu" ref="dropdownOther">
          <li><a href="/canvas_home">Home??</a></li>
          <li><a href="#" @click.prevent="pushForum">Forum</a></li>
          <li><a href="/market">Marketplace (Not Real)</a></li>
          <li><a href="/docs">Api Docs</a></li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script>
import { getUserinfo, removeUserinfo } from '@/utils/helpers';
export default {
  name: "HeaderView",
  props: {
    parentView: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      username: '',
      picture: '',
      dropdownUserVisible: false,
      dropdownOtherVisible: false
    };
  },
  methods: {
    async home() {
      const userInfo = await getUserinfo();
      if (userInfo) {
        this.username = userInfo.username;
        this.picture = userInfo.picture;
      }
    },
    toggleUserDropdown() {
      this.dropdownUserVisible = !this.dropdownUserVisible;
      this.relocateUserDropdown();
    },
    dropdownUserHide() {
      setTimeout(() => {
        this.dropdownUserVisible = false;
      }, 100);
    }
    ,
    pushForum(){
      this.$router.push({name:"ForumList"})
    },
    pushHome(){
      this.$router.push({ name: 'Home' });
    },
    relocateUserDropdown() {
      const profilePic = this.$refs.pp;
      if (profilePic) {
        let pp = profilePic.getBoundingClientRect();
        this.$refs.dropdownUser.style.left = `${pp.x + pp.width / 2 - 75}px`;
      }
    },
    toggleOtherDropdown() {
      this.dropdownOtherVisible = !this.dropdownOtherVisible;
      this.relocateOtherDropdown();
    },
    dropdownOtherHide() {
      setTimeout(() => {
        this.dropdownOtherVisible = false;
      }, 100);
    },
    relocateOtherDropdown() {
      const other = this.$refs.other;
      if (other) {
        let o = other.getBoundingClientRect();
        this.$refs.dropdownOther.style.left = `${o.x + o.width / 2 - 75}px`;
      }
    },
    async logout() {
      this.username = "";
      removeUserinfo();
      sessionStorage.removeItem('loginJwt');
      this.$emit("logout");
      this.$router.push({ name: this.parentView });
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
}

.navbar {
  display: flex;
  justify-content: space-evenly;
  padding: 0;
  list-style: none;
  overflow: auto;
}

nav li {
  text-align: center;
  position: relative;
}

nav a {
  color: white;
  text-decoration: none;
  padding: 10px 15px;
  display: block;
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