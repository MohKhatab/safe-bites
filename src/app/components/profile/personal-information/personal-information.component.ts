import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import { ImagesService } from '../../../services/images.service';

@Component({
  selector: 'app-personal-information',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.css',
})
export class PersonalInformationComponent implements OnInit {
  personalInformation: FormGroup;
  isEditing: boolean = false;
  userId?: string;
  userImage: string = '';
  newUserImage: string = '';
  imageId: string = '';
  cacheBuster: string = '';
  userData: any;

  constructor(
    private toastr: ToastrService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private imageService: ImagesService,
    private cdr: ChangeDetectorRef
  ) {
    this.personalInformation = this.fb.group({
      firstName: [{ value: '', disabled: true }, Validators.required],
      lastName: [{ value: '', disabled: true }],
      email: [
        { value: '', disabled: true },
        [Validators.required, Validators.email],
      ],
      phone: [
        { value: '', disabled: true },
        [Validators.pattern(/^(010|011|012|015)\d{8}$/)],
      ],
      inputImage: [{ value: '', disabled: true }],
    });
  }

  async ngOnInit() {
    this.userId = (await (this.route.snapshot.paramMap.get('id') ||
      localStorage.getItem('userId'))) as string | undefined;
    console.log('Retrieved userId:', this.userId);
    if (this.userId) {
      this.getUserData();
    } else {
      this.toastr.error('User id not found', 'Error');
    }
  }

  getUserData() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.toastr.error('No authentication token found', 'Error');
      return;
    }

    if (this.userId) {
      this.usersService.getUserById(this.userId, token).subscribe({
        next: userData => {
          if (
            !userData ||
            !userData.user ||
            Object.keys(userData.user).length === 0
          ) {
            this.toastr.error('User data is empty', 'Error');
            return;
          }
          this.userData = userData;
          if (userData.user) {
            this.personalInformation.patchValue({
              firstName: userData.user.firstName || '',
              lastName: userData.user.lastName || '',
              email: userData.user.email || '',
              phone: userData.user.phone || '',
            });
            this.userImage =
              userData.user.image?.imageUrl ||
              'images/default-profile-image.webp';
          }
          this.personalInformation.disable();
          this.personalInformation.get('email')?.disable();
          this.personalInformation.get('inputImage')?.disable();
        },
        error: error => {
          console.error('Error fetching user data:', error);
          this.toastr.error('Failed to load user data', 'Error');
        },
      });
    }
  }

  toggleEditing() {
    this.isEditing = !this.isEditing;

    if (this.isEditing) {
      this.personalInformation.get('firstName')?.enable();
      this.personalInformation.get('lastName')?.enable();
      this.personalInformation.get('phone')?.enable();
      this.personalInformation.get('inputImage')?.enable();
    } else {
      this.personalInformation.disable();
      this.personalInformation.get('email')?.disable();
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.personalInformation.get(field);
    if (field === 'email' && control?.disabled) {
      return false;
    }
    return control?.invalid && control?.touched ? true : false;
  }

  onButtonClick() {
    if (!this.isEditing) {
      this.toggleEditing();
    } else {
      this.submitForm();
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.newUserImage = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.uploadImage(file);
  }

  uploadImage(file: File) {
    const token = localStorage.getItem('token');
    if (!token) {
      this.toastr.error('Authentication token is missing', 'Error');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    this.imageService.uploadUserImage('users', formData, token).subscribe({
      next: response => {
        console.log('Full Image Upload Response:', response);
        this.toastr.success('Profile picture updated successfully!', 'Success');

        if (response && response.data && response.data.imageUrl) {
          const newImageUrl = response.data.imageUrl + '?v=' + Date.now();
          this.cacheBuster = Date.now().toString();
          this.userImage = newImageUrl;
          localStorage.setItem('profileImageUrl', newImageUrl);
          this.newUserImage = '';
          this.cdr.detectChanges();
        }

        if (response.data._id) {
          this.imageId = response.data._id;
          console.log('Saved Image ID:', this.imageId);
        }
      },
      error: error => {
        console.error('Error uploading image:', error);
        this.toastr.error('Failed to upload profile picture', 'Error');
      },
    });
  }

  submitForm() {
    const updatedData = this.personalInformation.getRawValue();
    delete updatedData.email;
    delete updatedData.inputImage;

    this.personalInformation.get('firstName')?.markAsTouched();
    this.personalInformation.get('lastName')?.markAsTouched();
    this.personalInformation.get('phone')?.markAsTouched();

    if (
      this.personalInformation.get('firstName')?.invalid ||
      this.personalInformation.get('lastName')?.invalid ||
      this.personalInformation.get('phone')?.invalid
    ) {
      this.toastr.error('Please fill in all fields correctly.', 'Error');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.toastr.error('Authentication token is missing', 'Error');
      return;
    }

    const currentImageId = this.userData?.user?.image?._id;
    if (this.imageId) {
      updatedData.image = this.imageId;
    } else if (currentImageId) {
      updatedData.image = currentImageId;
    }

    Object.keys(updatedData).forEach(key => {
      if (!updatedData[key]) {
        delete updatedData[key];
      }
    });
    console.log('Updated User', updatedData);

    const previousUserImage = this.userImage;

    this.usersService.updateUser(this.userId!, updatedData, token).subscribe({
      next: userUpdatedData => {
        this.toastr.success('User data updated successfully', 'Success');
        this.isEditing = false;
        this.personalInformation.disable();
        this.personalInformation.get('email')?.disable();
        this.userImage =
          userUpdatedData.user?.image?.imageUrl ||
          previousUserImage ||
          'images/default-profile-image.webp';
        console.log('User Image after update:', this.userImage);
        this.cacheBuster = Date.now().toString();
      },
      error: err => {
        this.toastr.error('Failed to update user data', 'Error');
      },
    });
  }
}

/*
  uploadImage(file: File) {
    const token = localStorage.getItem('token');
    if (!token) {
      this.toastr.error('Authentication token is missing', 'Error');
      return;
    }
  
    const formData = new FormData();
    formData.append('image', file);
  
    this.imageService.uploadUserImage("users", formData, token).subscribe({
      next: (response) => {
        console.log('Image Upload Response:', response);
        this.toastr.success('Profile picture updated successfully!', 'Success');
  
        if (response.imageUrl) {
          this.userImage = response.imageUrl;
          this.newUserImage = '';
          this.cacheBuster = Date.now().toString();
        }
        
        if(response.data._id){
          this.imageId = response.data._id;
          console.log("Saved Image ID:", this.imageId);
        }
        

      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.toastr.error('Failed to upload profile picture', 'Error');
      }
    });
  }
  */

// onSubmit() {
//   if(this.personalInformation.invalid){
//     this.personalInformation.markAllAsTouched();
//     console.log('Form is not valid');
//     return;
//   }

//   console.log('Data Submitted Successfully', this.personalInformation.value);
//   this.toggleEditing();
//   setTimeout(() => {
//     this.toastr.success('Data updated successfully!', 'Success');
//   }, 0);
// }
