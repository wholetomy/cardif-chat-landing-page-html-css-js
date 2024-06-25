## Como fazer o deploy

#### Conecte na máquina da AWS
`ec2-user`

#### Entre no diretório da aplicação
`cd /var/www/html/repos/cardif-chat-landing-page-html-css-js`

#### Efetue a atualização do repositório e envie para a versão correta
`sudo git pull`

`sudo cp -r /var/www/html/repos/cardif-chat-landing-page-html-css-js/* /var/www/html/cardif-dev`

`sudo cp -r /var/www/html/repos/cardif-chat-landing-page-html-css-js/* /var/www/html/cardif-accept/`

`sudo cp -r /var/www/html/repos/cardif-chat-landing-page-html-css-js/* /var/www/html/cardif-prod`

#### Reinicie o servidor Apache
`sudo systemctl restart httpd`