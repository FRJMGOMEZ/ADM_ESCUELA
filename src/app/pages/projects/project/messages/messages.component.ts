import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { Message  } from 'src/app/models/message.model';
import { ChatServices } from '../../../../providers/chat.service';
import { UploadFilesServices } from '../../../../providers/upload-files.service';
import { MessageOrder } from '../../../../models/message.model';
import { Subscription } from 'rxjs';
import { FileOrder } from '../../../../models/file.model';
import { ProjectServices } from '../../../../providers/project.service';
import { MainProjectsComponent } from '../../mainProjects.component';
import { UserServices } from '../../../../providers/user.service';
import { ShowFilesModalController } from '../../../../modals/show.files-modal/showfilesModal.controller';
import { ProjectComponent } from '../project.component';


@Component({
  selector: "app-messages",
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.less"]
})
export class MessagesComponent implements OnInit, OnDestroy {
  @ViewChild("scroll") scroll: ElementRef;

  userOnline: User;

  messages: Message[] = [];

  message: string;
  download:boolean=true

  imgUpload: File;
  temporaryImg: any;

  fileUpload: File;
  fileTitle: string;

  messagesSubscription: Subscription = null;
  filesSubscription: Subscription = null;
  socketSubscription:Subscription=null;

  loading:boolean = false

  constructor(
    private _uploadFilesServices: UploadFilesServices,
    private _chatServices: ChatServices,
    public projectComponent: ProjectComponent,
    public mainProjectsComponent:MainProjectsComponent,
    public _projectServices: ProjectServices,
    private _userServices: UserServices,
    private _showFilesModalController: ShowFilesModalController
  ) {
    this.userOnline = this._userServices.userOnline;
  }

  ngOnInit() {

    this.socketSubscription = this._chatServices.messagesSocket().subscribe()

    this.messagesSubscription = this._chatServices.messages$.subscribe(
      (messageOrder: MessageOrder) => {
        if (messageOrder.order === "get") {
            if(this.messages.length < 15){
              setTimeout(() => {
                this.scrollToBottom()
              })
            }else{
              this.scroll.nativeElement.scrollTop = 1;
            }
          this.messages.unshift(messageOrder.message);    
        }else if (messageOrder.order === 'post'){
            setTimeout(() => {
              this.scrollToBottom();
            });
          this.messages.push(messageOrder.message)
        }else if (messageOrder.order === "delete") {
          this.messages = this.messages.filter(message => {
            return message._id != messageOrder.message._id;
          });
        }
      }
    );

    this.checkFrom().then((res: any) => {
      this._chatServices.getMessages(this._projectServices.projectSelectedId, res).subscribe();
    });
    
    this.filesSubscription=this._uploadFilesServices.files$.subscribe((fileOrder: FileOrder) => {
      if (fileOrder.order === "post") {
        let message;
          message = new Message(
            this.userOnline._id,
            this._projectServices.projectSelectedId,
            this.message,
            fileOrder.file._id
          );
        this._chatServices.postMessage(message).subscribe();
      }else if(fileOrder.order === 'delete'){
        this.messages.forEach((message:any)=>{
          if(message.file){
            if(message.file._id === fileOrder.file._id){
              this._chatServices.deleteMessage(message._id).subscribe()
            }
          }
          })
      }
    });
  }
 
  scrollToBottom(): void {
      this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
  }

  checkFrom() {
    return new Promise((resolve, reject) => {
      if (this.messages.length < this._projectServices.messagesCount) {
        if (this._projectServices.messagesCount - 15 >= 0) {
          let from = this._projectServices.messagesCount - 15;
          resolve(from)
        } else {

          if(this.messages.length === 0){
            resolve(0)
          }else{
            resolve(this._projectServices.messagesCount - this.messages.length)
          }
        }
      } else {
        resolve(0)
      }
    });
  }

  getMoreMessages(){
    setTimeout(()=>{
      if(this.scroll.nativeElement.scrollTop === 0){
        if (this.messages.length < this._projectServices.messagesCount) {
          let from;
          if (this._projectServices.messagesCount - 15 >= 0) {
            from = this._projectServices.messagesCount - 15;
          } else {
            from = this._projectServices.messagesCount - this.messages.length;
          }
          this._chatServices.getMessages(this._projectServices.projectSelectedId, from).subscribe(()=>{
          })
        } else { return }
      }
    },3000)
  }

  selectFile(file: File) {
    if (!file) {
      this.imgUpload = null;
      return;
    }
    if (file.type.indexOf("pdf") >= 0) {
      this.fileTitle = file.name;
      this.fileUpload = file;
      this.imgUpload = null;
      this.temporaryImg = null;
    } else if (file.type.indexOf("image") >= 0) {
      this.imgUpload = file;
      this.fileTitle = file.name;
      let reader = new FileReader();
      let urlImgTemp = reader.readAsDataURL(file);
      reader.onloadend = () => {
        this.temporaryImg = reader.result;
      };
      this.fileUpload = null;
    }
  }

  sendMessage() {
    if (this.imgUpload) {
      this._uploadFilesServices.uploadFile(
        this.imgUpload,
        "projectFiles",
        this._projectServices.projectSelectedId,
         this.download
      );
      this.imgUpload = null;
      this.temporaryImg = null;
    } else if (this.fileUpload) {
      this._uploadFilesServices.uploadFile(
        this.fileUpload,
        "projectFiles",
        this._projectServices.projectSelectedId,
        this.download
      )
      this.fileUpload = null;
    } else {
      if(this.message.trim().length >0){
        let message = new Message(
          this.userOnline._id,
          this._projectServices.projectSelectedId,
          this.message
        );
        this._chatServices.postMessage(message).subscribe(()=>{
          this.message='';
        });
      }else{
        return
      }
    }
  }

  openFile(id: string) {
    this._showFilesModalController.showModal(id);
    this._showFilesModalController.notification.emit();
  }
  
  ngOnDestroy() {
    this.filesSubscription.unsubscribe()
    this.messagesSubscription.unsubscribe();
   this.socketSubscription.unsubscribe();
   this._projectServices.messagesCount = 0;
  }
}