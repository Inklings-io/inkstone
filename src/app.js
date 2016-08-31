import {Router, RouterConfiguration} from 'aurelia-router';

export class App {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router){
    config.title = 'Mobilepub';
    config.map([
      { route: '',           moduleId: 'home',   	  title: 'Home'},
      { route: 'login',      moduleId: 'login',  	  title: 'Login'},
      { route: 'settings',   moduleId: 'settings',    title: 'Settings'},
      { route: 'post/:num',  moduleId: 'post-detail', name:'post' },
      { route: 'post/new',   moduleId: 'post-detail', name:'newpost' }
    ]);

    this.router = router;
  }
}
