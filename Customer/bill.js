document.addEventListener('DOMContentLoaded', async function () {
    const orderId = localStorage.getItem('order_id');

    if (!orderId) {
        alert('No order details found.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/order/${orderId}`);
        const data = await response.json();

        if (data.status === 'success') {
            const orderDetailsContainer = document.getElementById('order-details');
            const jsondata = JSON.stringify(data.data.details);
            const details = JSON.parse(jsondata);
            const orderItems = details.map(item => `<p>Item Name: ${item.name} - Price: ₹${item.price} - Qty: ${item.quantity}</p>`).join('');

            orderDetailsContainer.innerHTML = `
                <h2>Order ID: ${data.data.id}</h2>
                ${orderItems}
                <p>Total Price: ₹${details.reduce((total, item) => total + item.price * item.quantity, 0)}</p>
            `;

            //Download Bill
            document.getElementById('download-bill').addEventListener('click', function () {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();

                doc.text("Order Confirmation", 10, 10);
                doc.text(`Order ID: ${data.data.id}`, 10, 20);
                details.forEach((item, index) => {
                    doc.text(`Item Name: ${item.name} - Price: ${item.price} - Qty: ${item.quantity}`, 10, 30 + index * 10);
                });
                doc.text(`Total Price: ₹${details.reduce((total, item) => total + item.price * item.quantity, 0)}`, 10, 30 + details.length * 10);
                doc.save('bill.pdf');
            });

        } else {
            console.error('Failed to fetch order details:', data.message);
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
    }
});

// function downloadBill() {
//     const orderDetails = document.getElementById('order-details').innerHTML;
//     const billContent = `
//         <html>
//             <head>
//                 <style>${document.querySelector('link[rel=stylesheet]').outerHTML}</style>
//             </head>
//             <body>
//                 <h1>Order Confirmation</h1>
//                 ${orderDetails}
//             </body>
//         </html>
//     `;
//     const blob = new Blob([billContent], { type: 'text/html' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'bill.html';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// }

function downloadPDF() {
    const orderDetails = document.getElementById('order-details');
    
    html2canvas(orderDetails, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgProps= pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('order-bill.pdf');
    });
}
