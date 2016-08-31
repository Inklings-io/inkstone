import {MicropubAPI} from './micropub';
import {areEqual} from './utility';

export class PostDetails {
  static inject() { return [MicropubAPI]; }

  constructor(mp){
    this.mp = mp;
  }

  activate(params, routeConfig) {
    this.routeConfig = routeConfig;

    return this.mp.getContactDetails(params.id).then(contact => {
      this.contact = contact;
      this.routeConfig.navModel.setTitle(contact.firstName);
      this.originalContact = JSON.parse(JSON.stringify(contact));
    });
  }

  get canSave() {
    return this.contact.firstName && this.contact.lastName && !this.mp.isRequesting;
  }

  save() {
    this.mp.saveContact(this.contact).then(contact => {
      this.contact = contact;
      this.routeConfig.navModel.setTitle(contact.firstName);
      this.originalContact = JSON.parse(JSON.stringify(contact));
    });
  }

  canDeactivate() {
    if (!areEqual(this.originalContact, this.contact)){
      return confirm('You have unsaved changes. Are you sure you wish to leave?');
    }

    return true;
  }
}
