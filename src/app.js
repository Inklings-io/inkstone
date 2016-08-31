import {Router, RouterConfiguration, Redirect} from 'aurelia-router';

export class App {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router){
    config.title = 'Mobilepub';
	var step = new AuthorizeStep;
    config.addAuthorizeStep(step);
    config.map([
      { route: '',           moduleId: 'home',   	  title: 'Home',		auth: true  },
      { route: 'login',      moduleId: 'login',  	  title: 'Login',		auth: false },
      { route: 'settings',   moduleId: 'settings',    title: 'Settings',	auth: true  },
      { route: 'post/:num',  moduleId: 'post-detail', name:'post',			auth: true  },
      { route: 'post/new',   moduleId: 'post-detail', name:'newpost',		auth: true  }
    ]);

    this.router = router;
  }
}

class AuthorizeStep {
  run(navigationInstruction, next) {
    if (navigationInstruction.getAllInstructions().some(i => i.config.auth)) {
      var isLoggedIn = false ;// insert magic here;
      if (!isLoggedIn) {
        return next.cancel(new Redirect('login'));
      }
    }

    return next();
  }
}
