import { Elysia } from 'elysia';
import * as SkillsController from '../controllers/skills.controller';

export const skillsRoute = new Elysia({ prefix: '/skills', tags: ['Skills'] })

    // GET /skills/:userId 
    .get('/:userId', SkillsController.getSkillsHandler)

    // POST /skills 
    .post('/', SkillsController.addSkillHandler)

    // PUT /skills/:skillId
    .put('/:skillId', SkillsController.updateSkillHandler)

    // DELETE /skills/:skillId
    .delete('/:skillId', SkillsController.deleteSkillHandler);
