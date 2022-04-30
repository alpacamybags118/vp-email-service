notes:

4 lambdas - 
add VP - adds a VP to the database, then triggers email service to send an email
get VPs - gets a list of the VPs in the DB
send email - will send an email to the specified VP
invitationeventhandler - will take in a JWT and update the VP status based on if they accepted or rejected the invite, also expires

JWT token for encoding accept or reject w/ expiration - will need to be encrypted with KMS to prevent tampering

NODE_ENV=test for local sqs

TODO:
1. create env files/configs for environment
2. get UI to load vps
3. Add add vp to ui
4. add resend email to ui
5. implement jwt token for email
6. write unit tests
7. write documentation
