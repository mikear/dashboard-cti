import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { ArticleEntity } from './article.entity';

export enum IocType {
    IP = 'ip',
    DOMAIN = 'domain',
    URL = 'url',
    HASH_MD5 = 'hash_md5',
    HASH_SHA1 = 'hash_sha1',
    HASH_SHA256 = 'hash_sha256',
    CVE = 'cve',
    EMAIL = 'email',
}

@Entity('iocs')
export class IocEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'article_id', type: 'uuid' })
    articleId: string;

    @ManyToOne(() => ArticleEntity, article => article.iocs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'article_id' })
    article: ArticleEntity;

    @Column({ type: 'varchar', length: 50 })
    type: IocType;

    @Column({ type: 'text' })
    value: string;

    @Column({ name: 'normalized_value', type: 'text', nullable: true })
    normalizedValue: string;

    @Column({ type: 'text', nullable: true })
    context: string;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
    confidence: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
