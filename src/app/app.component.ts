import { Component, OnInit } from '@angular/core';
import { Speed } from '@ngx-fast-marquee/src/types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  speed: Speed = 'fast';
  play = true;
  ngOnInit(): void {
    setTimeout(() => {
      // this.items[0].name = 'Julian';
      // this.speed = 10;
      this.play = false;
      console.log('CHANGE PLAY TO FALSE');
      setTimeout(() => {
        this.play = true;
        console.log('CHANGE PLAY TO TRUE');
        setTimeout(() => {
          this.items[0].name =
            '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<';
          console.log('CHANGE first item name to Julian');
        }, 5000);
      }, 5000);
    }, 5000);
    console.log('init app component');
  }
  items = [
    {
      id: 1,
      name: '**BEGIN** Item 1 Long Text',
      image:
        'https://images.unsplash.com/photo-1682687220640-9d3b11ca30e5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 2,
      name: 'Item 2',
      image:
        'https://plus.unsplash.com/premium_photo-1699292639215-6f34ff51daec?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 3,
      name: 'Item 3',
      image:
        'https://images.unsplash.com/photo-1698778574029-03a35fe6b2f2?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 4,
      name: 'Item 4',
      image:
        'https://images.unsplash.com/photo-1698680746129-89aea8bb512d?q=80&w=1943&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 4,
      name: '*',
      image:
        'https://images.unsplash.com/photo-1698778573868-75a5c62ab43e?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 5,
      name: 'Item 5 Another Long long Text!',
      image:
        'https://images.unsplash.com/photo-1682685797898-6d7587974771?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 6,
      name: 'Item 6',
      image:
        'https://plus.unsplash.com/premium_photo-1697477564565-2a95d76e921a?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 7,
      name: 'Item 7 Medium',
      image:
        'https://images.unsplash.com/photo-1699520497348-9d6670d177d6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 8,
      name: 'Item 8 Medium Medium',
      image:
        'https://images.unsplash.com/photo-1699365623145-a94b3e07a520?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 9,
      name: 'Item 9',
      image:
        'https://images.unsplash.com/photo-1699391618617-e70493b6cd9e?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 10,
      name: 'WHAT CAN I D0! **END**',
      image:
        'https://images.unsplash.com/photo-1682687982107-14492010e05e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ];
}
