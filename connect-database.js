const { Client } = require("cassandra-driver");

const client = new Client({
  cloud: {
    secureConnectBundle: "./PRIVATE/secure-connect-testdb.zip",
  },
  credentials: {
    username: "OdtGcNOpNMtEwjrCtpmljCFi",
    password:
      ".fD6qAII7hTYZjXfcCA3jAXXJIaUB_EL8Jxqd_lBvdtQMF3WLZpxOr52Aapfg-IdoYAi9jOe8y0MQJpsiDpW66IHP5vc.v6PAx.Yi_iQ_B0T4alAEYcgz2dZpxnpgKJh",
  },
});

async function add_product(prod_id, prod_name, price, image, desc) {
  await client.connect();

  // Execute a query
  const rs = await client.execute(
    `INSERT INTO test_db.products (prod_id,prod_name,prod_price,date_modified,image,prod_desc) VALUES ( ${prod_id}, '${prod_name}','${price}', ${Date.now()}, textAsBlob('${image}'), '${desc}') ;`
  );

  // await client.shutdown();
}

async function get_products(prod_id, prod_name, price, image, desc) {
  await client.connect();

  // Execute a query
  const rs = await client.execute(
    `SELECT prod_id,prod_name,prod_price,prod_desc,date_modified, blobAsText(image) as blob_image from test_db.products;`
  );
  return rs.rows;
  // await client.shutdown();
}

get_products();
module.exports = {
  add_product,
  get_products,
};
