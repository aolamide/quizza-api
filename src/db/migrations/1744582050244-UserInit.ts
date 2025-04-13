import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserInit1744582050244 implements MigrationInterface {
  name = 'UserInit1744582050244';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(128) NOT NULL, \`email\` varchar(128) NOT NULL, \`password\` char(60) NOT NULL, \`resetPasswordToken\` char(40) NULL, \`resetPasswordExpires\` timestamp NULL, \`emailVerifyToken\` char(40) NULL, \`emailVerifySentAt\` timestamp NULL, \`isVerified\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), UNIQUE INDEX \`IDX_6699b8457beeaf928125b348e8\` (\`resetPasswordToken\`), UNIQUE INDEX \`IDX_f45fa91dee2807d1c829ec2330\` (\`emailVerifyToken\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_f45fa91dee2807d1c829ec2330\` ON \`user\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_6699b8457beeaf928125b348e8\` ON \`user\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``,
    );
    await queryRunner.query(`DROP TABLE \`user\``);
  }
}
