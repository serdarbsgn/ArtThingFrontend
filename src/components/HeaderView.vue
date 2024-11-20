<template>
  <header>
    <nav>
      <ul class="navbar">
        <li><a href="/">Home</a></li>
        <li ref="other"><a @click.prevent="toggleOtherDropdown" tabindex="0" href="#">Others</a></li>
        
        <li><a href="#" @click.prevent="pushProjects">Projects</a></li>
        <li v-if="username">
          <img :src="picture" alt="Profile Picture" class="profile-pic" ref="pp" @click.prevent="toggleUserDropdown"
            tabindex="0">
        </li>
        <template v-if="!username">
          <li><a ref="login" href="#" @click.prevent="toggleLoginDropdown">Login</a></li>
          <li><a ref="register" :class="['register', { active: triggerRegisterSuccessAnim }]" href="#"
              @click.prevent="toggleRegisterDropdown" @blur="dropdownRegisterHide" tabindex="0">Register</a></li>
        </template>
      </ul>
      <div v-show="dropdownUserVisible && username" @focusout="handleFocusOut('dropdownUser', $event)" tabindex="0">
        <ul class="dropdown-menu" ref="dropdownUser" tabindex="0">
          <li><a href="#" @click.prevent="pushUser">{{ username }}</a></li>
          <li><a href="/user">Settings</a></li>
          <li><a href="/cart">Your Cart</a></li>
          <li><a href="/orders">Your Orders</a></li>
          <li><a href="#" @click.prevent="logout">Logout</a></li>
        </ul>
      </div>
      <div v-show="dropdownOtherVisible" @focusout="handleFocusOut('dropdownOther', $event)" tabindex="0">
        <ul class="dropdown-menu" ref="dropdownOther" tabindex="0">
          <li><a href="/canvas_home">Home??</a></li>
          <li><a href="/forum">Forum</a></li>
          <li><a href="/games">Games</a></li>
          <li><a href="/gyrowheel">GyroWheel APP</a></li>
          <li><a href="/market">Marketplace (Not Real)</a></li>
          <li><a href="/project/docs">Api Docs</a></li>
        </ul>
      </div>
      <div v-show="dropdownLoginVisible" @focusout="handleFocusOut('dropdownLogin', $event)" tabindex="0">
        <ul class="dropdown-menu" ref="dropdownLogin" tabindex="0">
          <LoginView :redirectOnLogin="false" />
        </ul>
      </div>
      <div v-show="dropdownRegisterVisible" @focusout="handleFocusOut('dropdownRegister', $event)" tabindex="0">
        <ul class="dropdown-menu" ref="dropdownRegister" tabindex="0">
          <RegisterView :redirectOnLogin="false" @registerSuccess="registerSuccessAnim" />
        </ul>
      </div>
    </nav>
  </header>
</template>

<script>
import LoginView from './LoginView.vue';
import RegisterView from './RegisterView.vue';
import { username, picture, getUserinfo, logout, dropdownLoginVisible } from '@/utils/helpers';
export default {
  name: "HeaderView",
  components: { LoginView, RegisterView },
  data() {
    return {
      username,
      picture,
      dropdownUserVisible: false,
      dropdownOtherVisible: false,
      dropdownLoginVisible,
      dropdownRegisterVisible: false,
      triggerRegisterSuccessAnim: null
    };
  }, watch: {
    async username() {
      this.dropdownLoginVisible = false;
    },
    async dropdownLoginVisible() {
      if (this.dropdownLoginVisible) {
        this.relocateLoginDropdown();
      }
    }
  },
  methods: {
    handleFocusOut(ref, event) {
      const dropdown = this.$refs[ref]

      if (!dropdown.contains(event.relatedTarget)) {
        this.dropdownHide(ref);
      }
    },
    dropdownHide(ref) {
      if (ref === 'dropdownLogin') {
        this.dropdownLoginVisible = false;
      } else if (ref === 'dropdownRegister') {
        this.dropdownRegisterVisible = false;
      } else if (ref === 'dropdownOther') {
        this.dropdownOtherVisible = false;
      } else if (ref === 'dropdownUser') {
        this.dropdownUserVisible = false;
      }
    },
    toggleUserDropdown() {
      this.dropdownUserVisible = !this.dropdownUserVisible
      if (this.dropdownUserVisible) {
        this.$nextTick(() => {
          this.$refs.dropdownUser.focus();
        });
      }
      this.relocateUserDropdown();
    },
    toggleOtherDropdown() {
      this.dropdownOtherVisible = !this.dropdownOtherVisible;
      if (this.dropdownOtherVisible) {
        this.$nextTick(() => {
          this.$refs.dropdownOther.focus();
        });
      }
      this.relocateOtherDropdown();
    },
    toggleLoginDropdown() {
      const loginElement = this.$refs.login;
      if (loginElement) {
        loginElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      this.dropdownLoginVisible = !this.dropdownLoginVisible;
      if (this.dropdownLoginVisible) {
        this.$nextTick(() => {
          this.$refs.dropdownLogin.focus();
        });
      }
    },
    toggleRegisterDropdown() {
      const registerElement = this.$refs.register;
      if (registerElement) {
        registerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      this.dropdownRegisterVisible = !this.dropdownRegisterVisible;
      if (this.dropdownRegisterVisible) {
        this.$nextTick(() => {
          this.$refs.dropdownRegister.focus();
        });
      }
      this.relocateRegisterDropdown();
    },
    relocateUserDropdown() {
      const profilePic = this.$refs.pp;
      if (profilePic) {
        let pp = profilePic.getBoundingClientRect();
        this.$refs.dropdownUser.style.left = `${pp.x}px`;
      }
    },
    relocateOtherDropdown() {
      const other = this.$refs.other;
      if (other) {
        let o = other.getBoundingClientRect();
        this.$refs.dropdownOther.style.left = `${o.x}px`;
        this.$refs.dropdownOther.style.width = `${o.width}px`;
      }
    },
    relocateLoginDropdown() {
      const login = this.$refs.login;
      if (login) {
        let l = login.getBoundingClientRect();
        const windowWidth = window.innerWidth - 2.5 * l.width;
        if (windowWidth < l.x) {
          this.$refs.dropdownLogin.style.left = `${windowWidth}px`;
        } else {
          this.$refs.dropdownLogin.style.left = `${l.x}px`;
        }

      }
    }, 
    relocateRegisterDropdown() {
      const register = this.$refs.register;
      if (register) {
        let l = register.getBoundingClientRect();
        const windowWidth = window.innerWidth - 2.5 * l.width;
        if (windowWidth < l.x) {
          this.$refs.dropdownRegister.style.left = `${windowWidth}px`;
        } else {
          this.$refs.dropdownRegister.style.left = `${l.x}px`;
        }

      }
    },
    pushProjects() {
      this.$router.push({ name: "ProjectList" })
    },
    pushUser() {
      this.$router.push({ name: 'CreatorArtbookCover', params: { "creatorUsername": this.username } })
    },
    async logout() {
      this.dropdownUserVisible = false;
      logout();
    },
    registerSuccessAnim() {
      this.toggleRegisterDropdown();
      this.triggerRegisterSuccessAnim = true;
      setTimeout(() => {
        this.triggerRegisterSuccessAnim = null;
        this.toggleLoginDropdown();
      }, 500);
    },
    async home() {
      await getUserinfo();
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
  background-color: #662052;
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

.register {
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.register.active {
  transform: rotateY(360deg);
  background-color: #35ba35;
}
</style>