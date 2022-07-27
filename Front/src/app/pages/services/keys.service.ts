import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Key } from 'src/app/models/key.model';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;
const version = environment.version;

@Injectable({
  providedIn: 'root',
})
export class KeysService {
  constructor(private http: HttpClient) {}

  getMyKeys(userId: string): Observable<any> {
    return this.http.get(
      `${base_url}/${version}/keys?id=${userId}`,
      this.headers
    );
  }

  createKey(key: Key, userId: string): Observable<any> {
    return this.http.post(
      `${base_url}/${version}/keys`,
      { ...key, userId },
      this.headers
    );
  }

  createWorkgroupKey(
    key: Key,
    userId: string,
    workgroupId: string
  ): Observable<any> {
    return this.http.post(
      `${base_url}/${version}/keys/workgroup/${workgroupId}`,
      { ...key, userId },
      this.headers
    );
  }

  editKey(key: Key, userId: string, keyId: string): Observable<any> {
    return this.http.put(
      `${base_url}/${version}/keys?keyId=${keyId}`,
      { ...key, userId },
      this.headers
    );
  }

  shareKey(keyId: string, transits: any, senderId: string): Observable<any> {
    return this.http.post(
      `${base_url}/${version}/keys/share`,
      { keyId, transits, senderId },
      this.headers
    );
  }

  transit(userId: string): Observable<any> {
    return this.http.get(
      `${base_url}/${version}/keys/transit/${userId}`,
      this.headers
    );
  }

  acceptKey(
    transitId: string,
    senderId: string,
    receiverId: string,
    encryptedUserKey: string
  ): Observable<any> {
    return this.http.post(
      `${base_url}/${version}/keys/transit/${transitId}/sender/${senderId}/receiver/${receiverId}`,
      { encryptedUserKey },
      this.headers
    );
  }

  getSharedKeys(
    companyId: string,
    userId: string,
    ownerId: string
  ): Observable<any> {
    return this.http.get(
      `${base_url}/${version}/keys/shared/company/${companyId}/user/${userId}/owner/${ownerId}`,
      this.headers
    );
  }

  get headers(): any {
    return {
      headers: {
        'x-token': localStorage.getItem('x-token') || '',
      },
    };
  }
}
