import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback, ContactType } from '../shared/feedback';
import { flyInOut, expand } from '../animations/app.animation';
import { FeedbackService } from '../services/feedback.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host:{
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations:[
    flyInOut(),
    expand()
  ]
})
export class ContactComponent implements OnInit {

  feedbackForm: FormGroup;
  feedback: Feedback;
  contactType = ContactType;
  @ViewChild('ffrom') feedbackFormDirective;
  errMess: string;
  timeout: boolean;
  fbCopy: Feedback;

  formErrors = {
    'firstname': '',
    'lastname': '',
    'telnum': '',
    'email': ''
  };

  validationMessages = {
    'firstname': {
      'required': 'First name is required',
      'minlength': 'First name must be two character long',
      'maxlength': 'First name can not be more than 25 characters'
    },
    'lastname': {
      'required': 'Last name is required',
      'minlength': 'Last name must be two character long',
      'maxlength': 'Last name can not be more than 25 characters'
    },
    'telnum':{
      'required': 'Telephone number is required',
      'pattern': 'Telephone number must contain only numbers'
    },
    'email':{
      'required': 'Telephone number is required',
      'email':'Email not in valid format'
    }
  };

  constructor(private fb: FormBuilder,
    private feedbackService : FeedbackService) {
    this.createForm();
   }

  ngOnInit() {
  }

  createForm() {
    this.feedbackForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      lastname: ['',  [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      telnum: [0, [Validators.required, Validators.pattern]],
      email: ['', [Validators.required, Validators.email]],
      agree: false,
      contacttype: 'None',
      message: ''
    });

    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChange(data));

    this.onValueChange(); // (re)set form validation messages
  }

onValueChange(data?: any){
  if(!this.feedbackForm) {return;}
  const form = this.feedbackForm;
  for (const field in this.formErrors) {
    if(this.formErrors.hasOwnProperty(field)) {
      // clear previous error message ( if any )
      this.formErrors[field] = '';
      const control = form.get(field);
      if(control && control.dirty && !control.valid){
        const messages = this.validationMessages[field];
        for(const key in control.errors){
          if(control.errors.hasOwnProperty(key)){
            this.formErrors[field] += messages[key]+' ';
          }
        }
      }
    }
  }
}

  onSubmit(){
    this.feedback = this.feedbackForm.value;
    console.log(this.feedback);

    //saving data to json server
    this.feedbackService.submitFeedback(this.feedback)
    .subscribe(feedback => {
      this.feedback = feedback;
      this.fbCopy = feedback;
      },
      errmess => {this.feedback = null; this.fbCopy = null; this.errMess = <any>errmess;});

    this.timeout= true;
     setTimeout(feedbackForm => this.resetForm(), 5000);    
    
  }

  resetForm(){
    this.feedbackForm.reset({
      firstname: '',
      lastname: '',
      telnum: 0,
      email: '',
      agree: false,
      contacttype: 'None',
      message: ''
      });
      this.feedbackFormDirective.resetForm();
      this.timeout =false;
      this.fbCopy = null;
  }
}
