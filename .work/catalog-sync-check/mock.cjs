let requests = 0;
globalThis.fetch = async () => {
  const product = {id: 'p1', handle: 'sample', title: 'Test board', categories: [{handle:'clipboards'}],
    images: [{url:'https://example.test/board.jpg'}], variants: [{id:'v1', title:'Test unit', inventory_quantity:2,
    manage_inventory:true, price:{calculated_amount:1, currency_code:'inr'}}]};
  return Response.json(++requests === 1 ? {products:[product], next_cursor:'sample'} : {products:[],next_cursor:null});
};
