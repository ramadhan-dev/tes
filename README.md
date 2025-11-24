#### Project Ini 
---

## Table of contents
* [Fungsi](#Fungsi)
* [Install](#Install)
* [Autentication](#Autentication)
* [Logger](#Logger)
* [Endpoint](#Endpoint)
* [Dokumentasi](#Dokumentasi)

## Fungsi 
fungsi yang tersedia pada peoject ini antara lain

Function      | Create             | Read                | Update             | Delete            |
:------------ | :------------------| :-------------------| :------------------|-------------------|
Tenant        | :white_check_mark: |  :white_check_mark: | :white_check_mark: | :white_check_mark:|
Company        | :white_check_mark: |  :white_check_mark: | :white_check_mark: | :white_check_mark:|
Division        | :white_check_mark: |  :white_check_mark: | :white_check_mark: | :white_check_mark:|
USER        | :white_check_mark: |  :white_check_mark: | :white_check_mark: | :white_check_mark:|
User-location        | :white_check_mark: |  :white_check_mark: | :white_check_mark: | :white_check_mark:|


## Autentication
untuk authentication menggunakan jsonwebtoken
jadi setiap request yang masuk akan di periksa apkah tokennya valid atau tidak 

 - AUTH Login   :heavy_check_mark:    

 ```

 ## Request Header
 Authorization : Bearer {{token}}

 ```


## Logger
Untuk Log ada 2 macam yang digunakan

- Morgan :heavy_check_mark:  
    morgan digunakan untu merecord log request dari client, dan disimpan ke dalam file, yang nantinya bisa digunakan untuk pengecekan Reuest

- winston :heavy_check_mark: 
    winston digunakan unutk merecord log Query yang di jalankan, 

## Install
Apabila anda ingin menjalankan aplikasi ini di local anda bisa melakukan clone project ini di [ github repo](https://github.com/ramadhan-dev/Master-APis)
    
    ```
        ### clone project
        git clone git@github.com:ramadhan-dev/master-api-nodejs-prisma.git attendance
        
        ### masuk ke project yang telah di clone
        cd attendance
        
        ### install dependencies
        ### npm
        npm install
        
        ### yarn
        yarn install
        
        ### Generate Prisma Engine
        ### npm
        npm  prisma generate --schema=prisma/database2/schema.prisma
        
        ### yarn
        yarn prisma generate --schema=prisma/database2/schema.prisma



        ### Generate Database
        ### npm
        npm run prisma migrate dev --schema=prisma/database2/schema.prisma --name inisialisasi

        ### yarn
        yarn prisma migrate dev --schema=prisma/database2/schema.prisma --name inisialisasi


         ### Generate Seeder
        ### npm
        npm run seed

        ### yarn
        yarn seed



        ### Jalankan aplikasi, aplikasi secara defualt akan dijalankan di port 5000
        ### npm 
        npm run dev

        ### yarn
        yarn dec
    ```


## Endpoint
Function      | Create             | Read                | Update             | Delete            | GetOne            | 
:------------ | :------------------| :-------------------| :------------------|-------------------|-------------------|
Tenant        | /api/tenant/create |  /api/tenant/getAll | /api/tenant/update/{tenant_code}| /api/tenant/delete/{tenant_code}|/api/tenant/getOne/{tenant_code}|
Company        | /api/company/create |  /api/company/getAll | /api/company/update/{company_code}| /api/company/delete/{company_code}|/api/company/getOne/{company_code}|
Division        | /api/division/create |  /api/division/getAll | /api/division/update/{division_code}| /api/division/delete/{division_code}|/api/company/getOne/{division_code}|
user        | /api/user/create |  /api/user/getAll | /api/user/update/{user_id}| /api/user/delete/{user_id}|/api/company/getOne/{user_id}|
user        | /api/user-location/create |  /api/user-location/getAll | /api/user-location/update/{user_location_id}| /api/user-location/delete/{user_location_id}|/api/company/getOne/{user_location_id}|





## Dokumentasi
untuk dokumentasi bisa di liat di
