CREATE TABLE users (
	  id VARCHAR(36) NOT NULL,
	  name VARCHAR(50) NOT NULL,
 	  email VARCHAR(50) NOT NULL,
  	phone_number VARCHAR(20) NOT NULL,
  	password text NOT NULL,
  	CONSTRAINT users_pk PRIMARY KEY (id)
);

CREATE TABLE alerts (
	  id VARCHAR(36) NOT NULL,
	  user_id VARCHAR(36) NOT NULL,
  	stock VARCHAR(6) NOT NULL,
  	max_amount float DEFAULT 0,
  	min_amount float DEFAULT 0,
  	CONSTRAINT alerts_pk PRIMARY KEY (id),
  	FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_confirmation_codes (
	id VARCHAR(36) NOT NULL,
	user_id VARCHAR(36) NOT NULL,
  code VARCHAR(4) NOT NULL,
	expired_at TIMESTAMP NOT NULL,
  CONSTRAINT user_confirmation_codes_pk PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
