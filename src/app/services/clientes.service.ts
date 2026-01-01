import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from './data.service';

@Injectable({
    providedIn: 'root'
})
export class ClientesService {
    private http = inject(HttpClient);
    // URL base del backend
    private apiUrl = 'http://localhost:3000/apiTS/customers';

    constructor() { }

    // Obtener todos los clientes
    findAll(): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(this.apiUrl);
    }

    // Obtener un cliente por ID
    findOne(id: string): Observable<Cliente> {
        return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
    }

    // Crear un nuevo cliente
    create(cliente: any): Observable<Cliente> {
        return this.http.post<Cliente>(this.apiUrl, cliente);
    }

    // Actualizar un cliente existente
    update(id: string, cliente: any): Observable<Cliente> {
        return this.http.patch<Cliente>(`${this.apiUrl}/${id}`, cliente);
    }

    // Eliminar un cliente
    remove(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    // Consultar datos en SUNAT (DNI/RUC)
    consultarSunat(tipo: string, numero: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/consult/${tipo.toLowerCase()}/${numero}`);
    }
}
