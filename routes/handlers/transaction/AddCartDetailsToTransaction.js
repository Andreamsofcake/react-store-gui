export default function(cart, tx_data) {
	if (cart && cart.detail && cart.detail.length) {
		cart.detail.forEach( D => {
			tx_data.products.push(D.productName); // AVT product has mongo ID as productName
		});

		tx_data.data_blob = {
			detail: cart.detail,
			summary: cart.summary
		}
	}
	return tx_data;
}