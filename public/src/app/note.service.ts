import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
//Note interface to send in requests
export interface Note {
	name: string;
  image: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})

export class NoteService {
  //Exposes HttpClient module
  constructor(private http: HttpClient) { }
  //Upload method
  upload(note: Note): Observable<any> {
    //Sets up multipart/form-data for upload
    const formData = new FormData();
    //Appends appropriate fields
    formData.append('image', note.image);
    formData.append('name', note.name);
    formData.append('description', note.description);
    formData.append('uploader', window.localStorage.getItem('username'));
    //Post request to api upload endpoint
    return this.http.post('http://localhost:8080/api/upload', formData)
  			.pipe(//Pipes response
  				map((res: Response) => {
            //Print response in console
            console.log(res);
  				})
  			);
  }
  //Get note method, returns array of anys(should probably be Note objects)
  getNotes(): Observable<any[]> {
    //Get request to api view-notes endpoint
    return this.http.get<any[]>('http://localhost:8080/api/view-notes')
      .pipe(//Pipes response
        map((res: Response) => {
          //Print response in console
          console.log(res);
        })
      );
  }
}