create database upay;

\c upay

create table users(
    user_id bigint primary key,
    username varchar(42),
    steep varchar(100),
    phone_number varchar(15),
    service_id int,
    create_at timestamp with time zone default current_timestamp
);

create table cards(
    user_id bigint  references users(user_id),
    card_number varchar(16),
    card_date varchar(4),
    card_holder varchar(64),
    create_at timestamp with time zone default current_timestamp
);

create table orders (
    order_id serial primary key,
    user_id int references users(user_id),
    service_id int,
    card_number varchar(16),
    card_date varchar(4),
    schot text,
    summa int,
    create_at timestamp with time zone default current_timestamp
);


create table service(
    service_id serial primary key,
    service_name varchar(32)
);

create table master_service (
    service_id int references service(service_id),
    m_service_id int,
    service_name varchar(32)
);

insert into service (service_name) values ('📱 Mobile operatorlar'), ('🚃 Transport'), ('💳 Kashelok')

insert into master_service (service_id, m_service_id, service_name) values 
(1, 628, '📳 Humans'),
(1, 40, '🐝 Beeline'),
(1, 132, '🛑 Mobiuz'),
(1, 8, '🆔 Usell'),
(1, 163, '🌐 Uzmobile'),
(1, 5, '🅿️ Perfectum');

insert into master_service (service_id, m_service_id, service_name) values 
(2, 509, '🚌 ATTO'),
(2, 331, '🚖 GOTAXI'),
(2, 314, '🚕 GLOBALTAXI');

insert into master_service (service_id, m_service_id, service_name) values 
(3, 440, '🥝 Qiwi RUB');