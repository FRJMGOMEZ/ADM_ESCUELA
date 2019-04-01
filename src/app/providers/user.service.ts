import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { URL_SERVICES } from "../config/config";
import { map, catchError } from "rxjs/operators";
import { User} from '../models/user.model'
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
    providedIn: 'root'
})
export class UserServices {

    headers : HttpHeaders

    userOnline:User;

    token:string

    users:User[]=[]

    socket:boolean=false;

    count:number

    constructor(private http:HttpClient,
                private router:Router,
                private _errorHandler:ErrorHandlerService) { 
        this.headers = new HttpHeaders().set('token',localStorage.getItem('token'))
        this.uploadFromStorage();
    }

    isLogged() {
        return this.token.length > 5 ? true : false;
    }

    updateToken(){
        let url = `${URL_SERVICES}/updateToken`
        return this.http.get(url,{headers:this.headers}).pipe(map((res:any)=>{
            this.token = res.token;
            localStorage.setItem('token',this.token)
            return true
        })
        ,catchError(this._errorHandler.handleError))
    }

    postUser(user: User) {
        let url = `${URL_SERVICES}/user`;
        return this.http.post(url, user).pipe(
         catchError(this._errorHandler.handleError)
        )
    }

    login(user: User, rememberMe:boolean=false) {
           if (rememberMe) {
               localStorage.setItem("email", user.email);
           } else {
               localStorage.removeItem("email");
           }
        let url = `${URL_SERVICES}/login`;
        return this.http.post(url, user).pipe(map((res: any) => {
                this.saveInStorage(res.id, res.user, res.token)
        })
        ,catchError(this._errorHandler.handleError))
    }

    checkRole(){
        if(this.userOnline.role === 'ADMIN_ROLE'){
            return true
        }else{
            return false
        }
    }

    saveInStorage(id: string, user: User, token: string) {
        localStorage.setItem("id", id);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        this.userOnline = user;
        this.token = token;
    }

    uploadFromStorage() {
        if (localStorage.getItem("token")) {
            this.token = localStorage.getItem("token");
            this.userOnline = JSON.parse(localStorage.getItem("user"));
        } else {
            this.token = "";
            this.userOnline = null;
        }
    }

    getUsers(from: number = 0, limit: number = 5) {
        let url = `${URL_SERVICES}/users?from=${from}&limit=${limit}`;
        return this.http.get(url, { headers: this.headers }).pipe(map((res: any) => {
            this.count = res.count;
            this.users = res.users;
        }))
    }

    putUser(id:string, user:User){
        let url = `${URL_SERVICES}/user/${id}`
        return this.http.put(url,user,{headers:this.headers}).pipe((map((res:any)=>{
            if (res.user._id === this.userOnline._id) {
                this.saveInStorage(res.user._id, res.user, localStorage.getItem('token'))
                this.userOnline = res.user; 
            }else{
               this.users.forEach((user,index)=>{
                   if(user._id === res.user._id){
                       this.users[index]=res.user;
                   }
               }) 
            } 
        }))
            , catchError(this._errorHandler.handleError)
        )    
    }

    searchUsers(input: string, from: number = 0, limit: number = 5){
        let url = `${URL_SERVICES}/search/users/${input}?from=${from}&limit=${limit}`;
        return this.http.get(url,{headers:this.headers}).pipe(map((res:any)=>{
            this.count = res.count;
            this.users = res.users;
        }))
    }

    changeUserStatus(id:string){
        let url = `${URL_SERVICES}/changeUserStatus/${id}`
        return this.http.put(url,{},{headers:this.headers}).pipe(map((res:any)=>{ 
                this.users.forEach((user, index) => {
                    if (user._id === res.user._id) {
                        this.users[index].status = res.user.status;
                    }
                })
        }))
    }

    deleteUser(id:string){
        let url = `${URL_SERVICES}/user/${id}`
        return this.http.delete(url,{headers:this.headers}).pipe(map((res:any)=>{
            this.count--
        }))
    }

    changePassword(password1: string,password2:string) {
        let url = `${URL_SERVICES}/changePassword/${password1}/${password2}`
        return this.http.put(url,{},{ headers: this.headers }).pipe(
            catchError(this._errorHandler.handleError)
        )
    }

    changeRole(userId:string,role:string){
        let url = `${URL_SERVICES}/changeRole/${userId}/${role}`
        return this.http.put(url,{},{headers:this.headers})
    }

    logout() {
      this.token = "";
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("id");
      this.router.navigate(["/login"]).then(()=>{
          this.userOnline = null;
      })
    }
}


