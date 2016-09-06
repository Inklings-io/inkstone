import {MicropubAPI} from './micropub';
import {Router, RouterConfiguration, Redirect} from 'aurelia-router';

export class App {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router){
    config.title = 'Mobilepub';
    config.addAuthorizeStep(AuthorizeStep);
    config.map([
      { route: '',          moduleId: 'home',       name:'home',        title: 'Home',		  loggedIn: true  },
      { route: 'home',      moduleId: 'home',                           title: 'Home',		  loggedIn: true  },
      { route: 'login',     moduleId: 'login',      name:'login',       title: 'Login',		  loggedOut: true },
      { route: 'settings',  moduleId: 'settings',   name:'settings',    title: 'Settings',	  loggedIn: true  },
      { route: 'post/:num', moduleId: 'post',       name:'post',		title: 'Edit Post',   loggedIn: true  },
      { route: 'post',      moduleId: 'post',       name:'newpost',	    title: 'Create Post', loggedIn: true  }
    ]);

    this.router = router;
  }
}

class AuthorizeStep {

  run(navigationInstruction, next) {
    var mp = new MicropubAPI;
    var isLoggedIn = mp.logged_in();
    if (navigationInstruction.getAllInstructions().some(i => i.config.loggedIn)) {
      if (!isLoggedIn) {
        return next.cancel(new Redirect('login'));
      }
    } else if (navigationInstruction.getAllInstructions().some(i => i.config.loggedOut)) {
      if (isLoggedIn) {
        return next.cancel(new Redirect('home'));
      }
    }

    return next();
  }
}
