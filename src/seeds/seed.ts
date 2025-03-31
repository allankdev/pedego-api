import { AppDataSource } from '../data-source';
import { User } from '../user/user.entity';
import { Store } from '../store/store.entity';
import { Product } from '../product/product.entity';
import { Category } from '../category/category.entity';
import { UserRole } from '../user/enums/user-role.enum';
import { Neighborhood } from '../neighborhood/neighborhood.entity';
import { OpeningHour } from '../opening-hour/opening-hour.entity';
import { Coupon } from '../coupon/coupon.entity';

async function seed() {
  await AppDataSource.initialize();
  console.log('📦 Banco conectado com sucesso');

  const userRepo = AppDataSource.getRepository(User);
  const storeRepo = AppDataSource.getRepository(Store);
  const categoryRepo = AppDataSource.getRepository(Category);
  const productRepo = AppDataSource.getRepository(Product);
  const neighborhoodRepo = AppDataSource.getRepository(Neighborhood);
  const openingHourRepo = AppDataSource.getRepository(OpeningHour);
  const couponRepo = AppDataSource.getRepository(Coupon);

  const hashedPassword = '$argon2id$v=19$m=65536,t=3,p=4$H1TTiVKcz5n6AW8Ojg4jxQ$1elK1+dEv+zSRBlGVaU4AtYfdEBPz7FnLWy2knFFwWQ'; // senha: 123456

  const store = storeRepo.create({
    name: 'Allan Lanches',
    subdomain: 'allan-lanches',
    description: 'A melhor lanchonete da cidade!',
    email: 'contato@allanlanches.com',
    whatsapp: '+559999999999',
    country: 'Brasil',
    operationMode: 'ambos',
    deliveryTime: '30-45min',
    minOrderValue: 20,
    isOpen: true,
    printFontSize: 'medium',
    printPaperSize: '80mm',
    paymentMethods: ['dinheiro', 'pix', 'cartão'],
  });
  await storeRepo.save(store);
  console.log('🏪 Loja criada:', store.name);

  const admin = userRepo.create({
    name: 'Allan Admin',
    email: 'admin@allan.com',
    password: hashedPassword,
    role: UserRole.ADMIN,
    store,
  });
  await userRepo.save(admin);
  console.log('👤 Admin criado com senha 123456');

  const category = categoryRepo.create({
    name: 'Burgers',
    store,
  });
  await categoryRepo.save(category);

  const products = productRepo.create([
    {
      name: 'X-Burger',
      description: 'Pão, carne, queijo e maionese da casa',
      price: 19.9,
      available: true,
      store,
      category,
    },
    {
      name: 'X-Bacon',
      description: 'Clássico com bacon crocante',
      price: 24.9,
      available: true,
      store,
      category,
    },
    {
      name: 'X-Tudo',
      description: 'Tudo que há direito!',
      price: 29.9,
      available: true,
      store,
      category,
    },
  ]);
  await productRepo.save(products);
  console.log('🍔 Produtos criados:', products.length);

  const neighborhoods = neighborhoodRepo.create([
    {
      name: 'Centro',
      deliveryFee: 5.0,
      store,
    },
    {
      name: 'Bairro Novo',
      deliveryFee: 7.5,
      store,
    },
  ]);
  await neighborhoodRepo.save(neighborhoods);
  console.log('📍 Bairros adicionados:', neighborhoods.length);

  const hours = openingHourRepo.create([
    { day: 'segunda', open: '10:00', close: '22:00', store },
    { day: 'terça', open: '10:00', close: '22:00', store },
    { day: 'quarta', open: '10:00', close: '22:00', store },
    { day: 'quinta', open: '10:00', close: '22:00', store },
    { day: 'sexta', open: '10:00', close: '23:00', store },
    { day: 'sábado', open: '11:00', close: '23:00', store },
    { day: 'domingo', open: '17:00', close: '22:00', store },
  ]);
  await openingHourRepo.save(hours);
  console.log('🕐 Horários criados:', hours.length);

  const coupon = couponRepo.create({
    code: 'WELCOME10',
    discount: 10,
    active: true,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    store,
    createdBy: admin,
  });
  await couponRepo.save(coupon);
  console.log('🎁 Cupom criado:', coupon.code);

  console.log('✅ Seed finalizado com sucesso!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Erro ao rodar seed:', err);
  process.exit(1);
});
