create database upay;

\c upay

create table users(
    user_id bigint primary key,
    username varchar(42),
    steep varchar(100),
    phone_number varchar(15),
    create_at timestamp with time zone default current_timestamp
);

create table cards(
    user_id bigint  references users(user_id),
    card_number varchar(16),
    card_date varchar(4),
    card_holder varchar(64),
    create_at timestamp with time zone default current_timestamp
);

create table service(
    service_id int,
    service_name varchar(32)
);

