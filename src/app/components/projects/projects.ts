import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { LanguageService } from '../../services/language.service';
import { CardCarouselComponent } from './card-carousel/card-carousel';

type Repo = {
  name: string;
  url: string;
  /** Quando preenchido, substitui `name` no idioma EN. Usado p/ entradas genéricas como "Repositório". */
  nameEn?: string;
};

type Diagram = {
  src: string;
  captionPt: string;
  captionEn: string;
};

type ProjectDetailsSource = {
  longDescriptionPt: string;
  longDescriptionEn: string;
  diagrams?: readonly Diagram[];
};

type ProjectSource = {
  title: string;
  descriptionPt: string;
  descriptionEn: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  /** Lista de imagens p/ rotação em carousel automático no card. Se omitido, usa só `image`. */
  images?: readonly string[];
  tags: readonly string[];
  /** URL pública (deploy/produção/npm). Se ausente, botão "Visitar" não aparece. */
  url?: string;
  /**
   * Repositórios do projeto.
   * - 1 repo  → botão "Ver código" abre direto o GitHub
   * - 2+ repos → botão abre modal com a lista (ex: frontend + backend)
   * - undefined → botão "Ver código" não aparece
   */
  repos?: readonly Repo[];
  /** Conteúdo extra (diagrama de arquitetura, descrição longa) — abre modal "Detalhes". */
  details?: ProjectDetailsSource;
};

type DiagramView = { src: string; caption: string };
type ProjectDetails = { longDescription: string; diagrams: readonly DiagramView[] };
type RepoView = { name: string; url: string };

type Project = Omit<ProjectSource, 'descriptionPt' | 'descriptionEn' | 'details' | 'repos'> & {
  description: string;
  repos?: readonly RepoView[];
  details?: ProjectDetails;
};

const DEFAULT_IMAGE = 'images/project-default.svg';
const DEFAULT_W = 600;
const DEFAULT_H = 340;

const PROJECTS_SOURCE: readonly ProjectSource[] = [
  {
    title: 'Portflow',
    descriptionPt:
      'Plataforma de gestão de portfólios de investimentos com dashboard, métricas, eventos corporativos e previsão de séries temporais via ML. Desenvolvido como TCC.',
    descriptionEn:
      'Investment portfolio management platform with dashboard, metrics, corporate events and ML-based time-series forecasting. Built as my final undergraduate project.',
    image: 'projects/portflow/preview1.jpg',
    imageWidth: DEFAULT_W,
    imageHeight: DEFAULT_H,
    images: [
      'projects/portflow/preview1.jpg',
      'projects/portflow/preview2.png',
      'projects/portflow/preview3.png',
      'projects/portflow/preview4.png',
      'projects/portflow/preview5.png',
      'projects/portflow/preview6.png',
    ],
    tags: ['Angular 19', 'Spring Boot', 'FastAPI', 'PostgreSQL', 'JWT'],
    repos: [
      { name: 'Frontend (Angular 19)', url: 'https://github.com/Murilo-Bittencourt/tcc-front-portflow' },
      { name: 'Backend (Spring Boot)', url: 'https://github.com/Murilo-Bittencourt/tcc-back-end-portflow' },
      { name: 'Data Analytics (FastAPI)', url: 'https://github.com/Murilo-Bittencourt/tcc-data-analytcs' },
      { name: 'Bridge API (Python)', url: 'https://github.com/Murilo-Bittencourt/tcc-bridge-api' },
    ],
    details: {
      longDescriptionPt:
        'Solução full stack composta por quatro serviços independentes: o front em Angular 19 consome o back Java/Spring Boot (autenticação JWT e multi-tenancy), enquanto duas APIs Python isolam responsabilidades — uma FastAPI roda os pipelines de ETL/forecasting com pandas e a Bridge API serve de ponte para integrações externas. O diagrama abaixo mostra como os módulos se comunicam e onde cada peça vive na topologia.',
      longDescriptionEn:
        'Full stack solution made of four independent services: the Angular 19 frontend consumes the Java/Spring Boot backend (JWT auth and multi-tenancy), while two Python APIs isolate responsibilities — a FastAPI service runs ETL and forecasting pipelines with pandas, and the Bridge API connects to external integrations. The diagram below shows how modules talk to each other and where each piece sits in the topology.',
      diagrams: [
        {
          src: 'projects/portflow/Topologia_portflow.png',
          captionPt: 'Topologia da aplicação — serviços e fluxo de comunicação.',
          captionEn: 'Application topology — services and communication flow.',
        },
      ],
    },
  },
  {
    title: 'Noution v2',
    descriptionPt:
      'App de produtividade no estilo Notion com foco em integração AWS (S3, ALB, RDS, DynamoDB, SQS) e back-end orquestrado em Kubernetes sobre EC2. Front Angular 18 PWA com suporte offline.',
    descriptionEn:
      'Notion-style productivity app focused on AWS integration (S3, ALB, RDS, DynamoDB, SQS) with a Kubernetes-orchestrated backend running on EC2. Angular 18 PWA frontend with offline support.',
    image: 'projects/noution-v2/preview1.png',
    imageWidth: DEFAULT_W,
    imageHeight: DEFAULT_H,
    tags: ['AWS', 'Kubernetes', 'Spring Boot', 'Angular 18', 'PWA', 'SQS'],
    repos: [
      { name: 'Frontend (Angular 18 + PWA)', url: 'https://github.com/Murilo-Bittencourt/NoUtion-v2-front-end' },
      { name: 'Backend (Spring Boot + Java 21)', url: 'https://github.com/Murilo-Bittencourt/NoUtion-v2-back-end' },
    ],
    details: {
      longDescriptionPt:
        'O foco do projeto é a integração com a stack AWS rodando o back-end em Kubernetes: o front PWA Angular 18 (PrimeNG + editor Quill, instalável e offline) é servido pelo Amazon S3 atrás de um Application Load Balancer, enquanto o cluster Kubernetes (EC2 master/worker) hospeda os pods do Spring Boot, que persistem dados em Amazon RDS (PostgreSQL) e DynamoDB. O processamento assíncrono é enfileirado via Amazon SQS. JWT no auth e isolamento multi-tenant fecham o desenho.',
      longDescriptionEn:
        'The project centers on AWS stack integration with the backend running on Kubernetes: the Angular 18 PWA frontend (PrimeNG + Quill editor, installable and offline-capable) is served from Amazon S3 behind an Application Load Balancer, while the Kubernetes cluster (EC2 master/worker) hosts the Spring Boot pods, which persist data in Amazon RDS (PostgreSQL) and DynamoDB. Asynchronous processing is queued via Amazon SQS. JWT auth and multi-tenant isolation close the design.',
      diagrams: [
        {
          src: 'projects/noution-v2/estrutura-cloud.jpg',
          captionPt: 'Estrutura de cloud na AWS — Kubernetes (EC2 master/worker), S3, ALB, RDS, DynamoDB e SQS.',
          captionEn: 'AWS cloud structure — Kubernetes (EC2 master/worker), S3, ALB, RDS, DynamoDB and SQS.',
        },
      ],
    },
  },
  {
    title: 'ng-terminal-simulator',
    descriptionPt:
      'Biblioteca Angular publicada no npm com componentes de terminal customizáveis que simulam interfaces reais de macOS e Windows (cmd e PowerShell), com temas e animação de digitação.',
    descriptionEn:
      'Angular library published on npm with customizable terminal components simulating real macOS and Windows (cmd and PowerShell) interfaces, with themes and typing animation.',
    image: 'projects/terminal-simulator/preview1.png',
    imageWidth: DEFAULT_W,
    imageHeight: DEFAULT_H,
    tags: ['Angular', 'TypeScript', 'npm', 'Library'],
    url: 'https://www.npmjs.com/package/@Murilo-Bittencourt/ng-terminal-simulator',
    repos: [{ name: 'Repositório', nameEn: 'Repository', url: 'https://github.com/Murilo-Bittencourt/terminal-angular' }],
  },
  {
    title: 'Crypto App',
    descriptionPt:
      'Aplicação React + Vite que cifra e decifra textos via Web Crypto API: AES-GCM-256 com PBKDF2 (criptografia simétrica) e RSA-OAEP com SHA-256 (assimétrica).',
    descriptionEn:
      'React + Vite app that encrypts and decrypts text using the Web Crypto API: AES-GCM-256 with PBKDF2 (symmetric) and RSA-OAEP with SHA-256 (asymmetric).',
    image: 'projects/crypto-app/preview1.png',
    imageWidth: DEFAULT_W,
    imageHeight: DEFAULT_H,
    tags: ['React', 'Vite', 'Web Crypto API', 'Cryptography'],
    repos: [{ name: 'Repositório', nameEn: 'Repository', url: 'https://github.com/Murilo-Bittencourt/crypto-app-react' }],
  },
  {
    title: 'Comparador de Combustível',
    descriptionPt:
      'App mobile em Flutter que compara o gasto entre álcool e gasolina por km rodado, salvando comparações localmente para consulta posterior.',
    descriptionEn:
      'Flutter mobile app that compares ethanol vs gasoline cost per km driven, with local persistence of past comparisons for later reference.',
    image: DEFAULT_IMAGE,
    imageWidth: DEFAULT_W,
    imageHeight: DEFAULT_H,
    tags: ['Flutter', 'Dart', 'Mobile', 'Local Storage'],
    repos: [{ name: 'Repositório', nameEn: 'Repository', url: 'https://github.com/Murilo-Bittencourt/comparador-combustivel-flutter' }],
  },
  {
    title: 'Airmap Dijkstra',
    descriptionPt:
      'API Java/Spring Boot que aplica o algoritmo de Dijkstra sobre um grafo de aeroportos para encontrar a menor rota, com cache em Redis e documentação Swagger.',
    descriptionEn:
      'Java/Spring Boot API applying Dijkstra over an airport graph to compute shortest routes, with Redis caching and Swagger documentation.',
    image: DEFAULT_IMAGE,
    imageWidth: DEFAULT_W,
    imageHeight: DEFAULT_H,
    tags: ['Java', 'Spring Boot', 'Dijkstra', 'Redis', 'Docker'],
    repos: [{ name: 'Repositório', nameEn: 'Repository', url: 'https://github.com/Murilo-Bittencourt/airmap-dijkstra' }],
  },
  {
    title: 'Truco Pascal',
    descriptionPt:
      'Jogo de truco implementado em Pascal para a matéria de estrutura de dados, com modelagem de baralho via pilhas e listas e bot adversário jogável.',
    descriptionEn:
      'Truco card game built in Pascal for a data structures course, modeling the deck with stacks and lists and featuring a CPU opponent.',
    image: DEFAULT_IMAGE,
    imageWidth: DEFAULT_W,
    imageHeight: DEFAULT_H,
    tags: ['Pascal', 'Algorithms', 'Data Structures'],
    repos: [{ name: 'Repositório', nameEn: 'Repository', url: 'https://github.com/Murilo-Bittencourt/truco-pascal' }],
  },
];

@Component({
  selector: 'app-projects',
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, FaIconComponent, CardCarouselComponent],
})
export class ProjectsComponent {
  protected readonly langService = inject(LanguageService);
  protected readonly faGithub = faGithub;

  protected readonly projects = computed<readonly Project[]>(() => {
    const isPt = this.langService.lang() === 'pt';
    return PROJECTS_SOURCE.map(
      ({ descriptionPt, descriptionEn, repos, details, ...rest }) => ({
        ...rest,
        description: isPt ? descriptionPt : descriptionEn,
        repos: repos?.map(r => ({
          url: r.url,
          name: !isPt && r.nameEn ? r.nameEn : r.name,
        })),
        details: details
          ? {
              longDescription: isPt ? details.longDescriptionPt : details.longDescriptionEn,
              diagrams: (details.diagrams ?? []).map(d => ({
                src: d.src,
                caption: isPt ? d.captionPt : d.captionEn,
              })),
            }
          : undefined,
      }),
    );
  });

  /** Projeto cujos repositórios estão sendo exibidos no modal de repos. */
  protected readonly openReposFor = signal<Project | null>(null);
  /** Projeto cujos detalhes estão sendo exibidos no modal de detalhes. */
  protected readonly openDetailsFor = signal<Project | null>(null);

  private readonly reposDialog =
    viewChild<ElementRef<HTMLDialogElement>>('reposDialog');
  private readonly detailsDialog =
    viewChild<ElementRef<HTMLDialogElement>>('detailsDialog');

  protected openReposModal(project: Project): void {
    this.openReposFor.set(project);
    queueMicrotask(() => this.reposDialog()?.nativeElement.showModal());
  }

  protected closeReposModal(): void {
    this.reposDialog()?.nativeElement.close();
  }

  protected onReposDialogClose(): void {
    this.openReposFor.set(null);
  }

  protected onReposDialogBackdropClick(event: MouseEvent): void {
    if (event.target === this.reposDialog()?.nativeElement) {
      this.closeReposModal();
    }
  }

  protected openDetailsModal(project: Project): void {
    this.openDetailsFor.set(project);
    queueMicrotask(() => this.detailsDialog()?.nativeElement.showModal());
  }

  protected closeDetailsModal(): void {
    this.detailsDialog()?.nativeElement.close();
  }

  protected onDetailsDialogClose(): void {
    this.openDetailsFor.set(null);
  }

  protected onDetailsDialogBackdropClick(event: MouseEvent): void {
    if (event.target === this.detailsDialog()?.nativeElement) {
      this.closeDetailsModal();
    }
  }
}
