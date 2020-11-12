import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';
import { Mensaje } from '../interfaces/mensaje.interface';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Injectable()
export class ChatService {

  private itemsCollection: AngularFirestoreCollection<Mensaje>;

  public chats: Mensaje[] = []

  public ususario: any = {}

  constructor( private afs: AngularFirestore, public afAuth: AngularFireAuth ) {
    this.afAuth.authState.subscribe( user => {
      console.log('Estado del usuario: ', user)

      if (!user) {
        return
      }

      this.ususario.nombre = user.displayName
      this.ususario.uid = user.uid

    } )
  }

  login( proveedor: string ) {
    if (proveedor === 'google') {
      this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }
    else{
      this.afAuth.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider());
    }
  }
  logout() {
    this.ususario = {};
    this.afAuth.auth.signOut();
  }

  cargarMensajes () {
    this.itemsCollection = this.afs.collection<Mensaje>('chats', ref => ref.orderBy('fecha', 'desc')
                                                                            .limit(6) );

    return this.itemsCollection.valueChanges().pipe(map((mensajes: Mensaje []) =>{
      console.log(mensajes)

      this.chats = [];

      for(let mensaje of mensajes){
        this.chats.unshift( mensaje )
      }

      return this.chats

      //this.chats = mensajes
    }))
  }

  agregarMensaje( texto:string ){

    //TODO falta el UID del ususario
    let mensaje: Mensaje = {
      nombre: this.ususario.nombre,
      mensaje: texto,
      fecha: new Date().getTime(),
      uid: this.ususario.uid
    }

    return this.itemsCollection.add( mensaje )
  }
}
