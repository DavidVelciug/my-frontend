import React from 'react';
import InfoPageLayout from '../components/content/InfoPageLayout';

const Support: React.FC = () => {
  return (
    <InfoPageLayout
      title="Поддержка"
      subtitle="Помогаем быстро решить вопросы с заказами, аккаунтом и доступом к контенту."
      sections={[
        {
          title: 'Контакты',
          text: 'Email: support@memorylane.com. Время ответа обычно до 24 часов в рабочие дни.',
        },
        {
          title: 'Технические проблемы',
          text: 'Если страница не загружается или не работает загрузка файлов, приложите скриншот и описание действий перед ошибкой.',
        },
        {
          title: 'Вопросы по оплате и тарифам',
          text: 'Для платежных вопросов используйте тему письма "Оплата". Команда проверит транзакцию и вернется с решением.',
        },
      ]}
    />
  );
};

export default Support;
