const tabs = [
    { 
      id: 'invite', 
      label: 'Приглашения', 
      value: 1,
      data: [
        {
          id: "460",
          fighter: {
            name: "Волостнов Андрей",
            company: "ООО \"НИЦ \"АРСЕНАЛ\"",
            city: "Moscow"
          },
          event: {
            club: "234234",
            date: "23 апреля, Ср, 03:42",
            address: "234324 • Россия, Омск, Губкина"
          },
          fight: {
            number: "№ 1",
            type: "Рейтинговый",
            weight: "Light Heavyweight / 175lb / 79.38kg",
            rounds: "10",
            angle: "Синий",
            angleColor: "blue"
          },
          price: {
            fee: "1232",
            bonus: "5 000 000$",
            bonusVisible: false
          },
          link: "/career/invite/460/"
        },
        {
          id: "461",
          fighter: {
            name: "Смирнов Дмитрий",
            company: "ООО \"БОЕВОЙ КЛУБ\"",
            city: "Kazan"
          },
          event: {
            club: "Турнир чемпионов",
            date: "30 апреля, Вт, 19:00",
            address: "Спорткомплекс • Россия, Казань, Баумана"
          },
          fight: {
            number: "№ 2",
            type: "Рейтинговый",
            weight: "Welterweight / 170lb / 77.11kg",
            rounds: "8",
            angle: "Красный",
            angleColor: "red"
          },
          price: {
            fee: "2500",
            bonus: "10 000 000$",
            bonusVisible: false
          },
          link: "/career/invite/461/"
        }
      ]
    },
    { 
      id: 'contract', 
      label: 'Контракты', 
      value: 2,
      data: [
        {
          id: "contract-1",
          fighter: {
            name: "Петров Иван",
            company: "ООО \"БОЕЦ\"",
            city: "St. Petersburg"
          },
          event: {
            club: "Чемпионский бой",
            date: "15 мая, Пт, 20:00",
            address: "Арена \"Спартак\" • Россия, Москва, Лужники"
          },
          fight: {
            number: "№ 1",
            type: "Чемпионский",
            weight: "Middleweight / 185lb / 83.91kg",
            rounds: "12",
            angle: "Красный",
            angleColor: "red"
          },
          price: {
            fee: "50,000₽",
            bonus: "25,000₽",
            bonusVisible: true
          },
          link: "/career/contract/contract-1/"
        },
        {
          id: "contract-2",
          fighter: {
            name: "Козлов Сергей",
            company: "ООО \"АРЕНА\"",
            city: "Novosibirsk"
          },
          event: {
            club: "Титульный бой",
            date: "22 мая, Пт, 21:00",
            address: "Дворец спорта • Россия, Новосибирск, Красный проспект"
          },
          fight: {
            number: "№ 2",
            type: "Титульный",
            weight: "Heavyweight / 265lb / 120.2kg",
            rounds: "15",
            angle: "Синий",
            angleColor: "blue"
          },
          price: {
            fee: "100,000₽",
            bonus: "50,000₽",
            bonusVisible: true
          },
          link: "/career/contract/contract-2/"
        }
      ]
    },
  ]