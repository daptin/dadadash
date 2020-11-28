<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">


  <div class="row">
    <div class="col-6 offset-3 col-sm-6 col-xs-12">

      <div class="flex flex-center q-pa-xs">
        <q-card flat style="min-width: 400px; width: 30vw">
          <q-card-section>
            <span class="text-h4">Create a new account</span>

          </q-card-section>
          <q-card-section>
            <q-form
              @submit="onSubmit"
              class="q-gutter-md"
            >
              <q-input
                filled
                v-model="email"
                label="Email"
                lazy-rules
                :rules="[ val => val && val.length > 0 || 'Please type something']"
              />

              <q-input
                filled
                type="password"
                v-model="password"
                label="Password"
                lazy-rules
              />
              <q-input
                filled
                type="password"
                v-model="passwordConfirm"
                label="Confirm Password"
                lazy-rules
              />


              <div>
                <q-btn class="float-left" label="Sign up" type="submit" color="primary"/>
                <q-btn class="float-right" label="Login" @click="$router.push('/login')" type="reset" color="secondary"
                       flat/>
              </div>
            </q-form>

          </q-card-section>
        </q-card>


      </div>
    </div>
  </div>


</template>

<script>
import {mapActions} from 'vuex';

export default {
  name: 'PageSignup',
  methods: {
    ...mapActions(['executeAction', 'setToken']),
    onSubmit() {
      var that = this;
      that.executeAction({
        tableName: 'user_account',
        actionName: 'signup',
        params: {
          email: this.email,
          password: this.password,
          name: this.email,
          passwordConfirm: this.passwordConfirm,
        }
      }).then(function (responses) {
        for (var i = 0; i < responses.length; i++) {
          var response = responses[i];
          if (response.ResponseType == "client.notify") {
            if (response.Attributes.type == "success") {
              that.$q.notify(response.Attributes);
              break;
            } else {
              that.$q.notify(response.Attributes);
              return;
            }
          }
        }

        that.executeAction({
          tableName: 'user_account',
          actionName: 'signin',
          params: {
            email: that.email,
            password: that.password,
          }
        }).then(function (e) {
          for (var i = 0; i < e.length; i++) {
            if (e[i].ResponseType === "client.notify") {
              that.$q.notify(e[i].Attributes);
            }
          }
          that.setToken();
          that.$router.push("/workspace");
        }).catch(function (e) {
          console.log("Failed to sign in", arguments);
          that.$q.notify("Error", "Failed to login");
          that.$router.push('/login');
        })
      }).catch(function (res) {
        var e = res.response.data;
        console.log("Failed to register", e);

        for (var i = 0; i < e.length; i++) {
          if (e[i].ResponseType === "client.notify") {
            that.$q.notify(e[i].Attributes);
          }
        }

      })
    },
  },
  data() {
    return {
      email: null,
      password: null,
      passwordConfirm: null,
    }
  },
  mounted() {
  }
}
</script>
