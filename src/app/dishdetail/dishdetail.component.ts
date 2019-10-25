import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute} from '@angular/router';
import { Location, getLocaleDateTimeFormat, DatePipe} from '@angular/common';
import { Dish } from'../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  comment: Comment;
  commentForm: FormGroup;
  @ViewChild('cfrom') commentFormDirective;
  errMess: string;

  formErrors = {
    'author':'',
    'comment':''
    };
  validationMessages = {
      'author': {
        'required': 'Name is required',
        'minlength': 'Name must be two character long',
        'maxlength': 'Name can not be more than 25 characters'
      },
      'comment': {
        'required': 'Comment is required',
       }
  };

  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private cmt: FormBuilder,
    @Inject('BaseURL') private BaseURL) { 
      this.createForm();
    }

  ngOnInit() { 
    this.dishService.getDishIds()
      .subscribe((dishIds) => this.dishIds = dishIds);
      // const id = this.route.snapshot.params['id'];
      const id = this.route.params.pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); },
          errmess => this.errMess = <any>errmess);
  }

  createForm(){
    this.commentForm = this.cmt.group({
        author: ['', [Validators.required, Validators.minLength(2),Validators.maxLength(25)]],
        rating: 5,
        comment: ['', Validators.required],
        date:''
      });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChange(data));

    this.onValueChange(); // (re)set form validation messages
  }

  onValueChange(data?: any){
    if(!this.commentForm) {return;}
    const form = this.commentForm;
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

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit(){
    this.commentForm.get('date').setValue(new Date().toISOString());
    this.comment = this.commentForm.value;
    console.log(this.comment);
    this.dish.comments.push(this.comment);
    this.commentFormDirective.resetForm();
    this.commentForm.reset({
      rating: 5,
      comment: '',
      author: '',
      date: ''
    });
  }
}
